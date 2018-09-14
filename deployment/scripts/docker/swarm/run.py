#!/usr/bin/env python3

import logging
import argparse
import os
import sys
import subprocess

logging.basicConfig(
    level=logging.DEBUG,
    format="[%(asctime)s] - %(levelname)s - %(message)s",
    datefmt="%I:%M:%S %p",
)

parser = argparse.ArgumentParser(
    description="""
                Deployment script contains 4 steps (initialization,
                compilation, docker build and docker deployment), with the
                possibility of the each one to be skipped.
                """
)
parser.add_argument(
    "-si",
    "--skip-init",
    dest="skip_init",
    action="store_true",
    help="skip the project initialization step",
)
parser.add_argument(
    "-sc",
    "--skip-compile",
    dest="skip_compile",
    action="store_true",
    help="skip the project compilation step",
)
parser.add_argument(
    "-sb",
    "--skip-docker-build",
    dest="skip_docker_build",
    action="store_true",
    help="skip the docker images build step",
)
parser.add_argument(
    "-sd",
    "--skip-docker-deploy",
    dest="skip_docker_deploy",
    action="store_true",
    help="skip the docker deployment step",
)
parser.add_argument(
    "-u",
    "--update",
    dest="update_item",
    default="all",
    const="all",
    nargs="?",
    choices=["all", "typescript", "javascript"],
    help="specify the container to be updated, default option updates all",
)

args = parser.parse_args()


def script_execution_path(path):
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(path)
    logging.info(f"working directory: {os.getcwd()}")


def export_environment_variables(env_variables_file):
    """Export environment variables"""
    logging.info(f"export environment variables from {env_variables_file}")

    if os.path.exists(env_variables_file):
        with open(env_variables_file, "r") as env_variables:
            for line in env_variables:
                k, v = line.split("=")
                os.environ[k] = v.strip()
    else:
        logging.error(f"{env_variables_file} file not found")
        sys.exit()


def validate_docker_is_runnig():
    """Validate that docker daemon is running"""
    process = subprocess.Popen(
        ["docker", "info"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        universal_newlines=True,
    )
    _, err = process.communicate()
    if process.returncode != 0:
        logging.error(err)
        sys.exit()


def validate_log_directory_exists(path):
    """create the log directory prior to deployment
       if it does not already exist
    """
    log_dir = os.path.abspath(path)
    logging.info(f"validate if log directory: {log_dir} exists")
    if not os.path.exists(log_dir):
        logging.warning(f"{log_dir} directory does not exist. creating...")
        os.makedirs(log_dir)


def docker_swarm_is_runnig():
    """Check if docker swarm is running"""
    process = subprocess.Popen(
        ["docker", "node", "ls"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        universal_newlines=True,
    )
    out, err = process.communicate()
    return True if process.returncode == 0 else False


def docker_swarm_leave():
    """Leave docker swarm in case that it is initialized"""
    process = subprocess.Popen(
        ["docker", "swarm", "leave", "--force"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    process.wait()
    logging.info("left the docker swarm")


def docker_swarm_init(docker_swarm_advertise_adrr):
    """Initialize docker swarm"""
    if docker_swarm_advertise_adrr == "auto":
        process = subprocess.Popen(
            ["docker", "swarm", "init"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
        )
    else:
        process = subprocess.Popen(
            [
                "docker",
                "swarm",
                "init",
                "--advertise-addr",
                docker_swarm_advertise_adrr,
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
        )
    _, err = process.communicate()
    if process.returncode == 0:
        logging.info("started the docker swarm")
    else:
        logging.error(err)
        sys.exit()


def docker_remove_network(name):
    """Remove network in case that exists"""
    process = subprocess.Popen(
        ["docker", "network", "rm", name],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    process.wait()
    logging.info(f"removed the {name} network")


def docker_create_network(name):
    """Create a docker encrypted network"""
    process = subprocess.Popen(
        [
            "docker",
            "network",
            "create",
            "--opt",
            "encrypted",
            "--driver",
            "overlay",
            name,
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    process.wait()
    logging.info(f"created the {name} network")


def docker_create_config(name, file_path):
    """Create a docker config"""
    process = subprocess.Popen(
        ["docker", "config", "create", name, file_path],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        universal_newlines=True,
    )
    _, err = process.communicate()
    if process.returncode == 0:
        logging.info("created the " + name + " config from " + file_path)
    else:
        logging.error("unable to create " + name + " config from " + file_path)
        logging.error(err)
        sys.exit()


def docker_create_secret(name, file_path):
    """Create a docker secret"""
    process = subprocess.Popen(
        ["docker", "secret", "create", name, file_path],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        universal_newlines=True,
    )
    _, err = process.communicate()
    if process.returncode == 0:
        logging.info(f"created the {name} secret from {file_path}")
    else:
        logging.error(f"unable to create {name} secret from {file_path}")
        logging.error(err)
        sys.exit()


def generate_local_certificates(directory_path):
    if os.path.exists(directory_path + "/nodejs.root.crt") is False:
        process = subprocess.Popen(
            ["../scripts/docker/swarm/certificates/generate.sh"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        process.wait()
        logging.info("generate local certificates for reverse-proxy service")


def docker_stack_deploy(compose_file, stack):
    """Deploy a docker service"""
    process = subprocess.Popen(
        ["docker", "stack", "deploy", "-c", compose_file, stack],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        universal_newlines=True,
    )
    _, err = process.communicate()
    if process.returncode == 0:
        logging.info(f"deployed docker swarm {stack} service")
    else:
        logging.error(f"unable to deploy docker swarm {stack} service")
        logging.error(err)
        sys.exit()


def run_npm_scripts_from(directory):
    """Run NPM scripts from a specific directory

    Args:
        directory (str): the directory path
    """

    # change the node_env value to force NPM to install all dependecies
    node_env = os.environ["NODE_ENV"]
    os.environ["NODE_ENV"] = "development"

    for script in os.listdir(directory):
        logging.info("-" * 100)
        logging.info(f"initialize {script[:-3]}")
        subprocess.call([f"{directory}/{script}"])

    os.environ["NODE_ENV"] = node_env


def run_scripts_from(directory):
    """Run scripts from a specific directory

    Args:
        directory (str): the directory path
    """
    for script in os.listdir(directory):
        logging.info("-" * 100)
        logging.info(f"running script {script[:-3]}")
        subprocess.call([f"{directory}/{script}"])


def docker_service_update(directory):
    """Update a docker service"""
    for script in os.listdir(directory):
        logging.info("-" * 100)
        logging.info("update docker container")
        subprocess.call([f"{directory}/{script}"])


def main():
    script_execution_path("../../../config/")
    export_environment_variables(".env-nodejs")
    validate_docker_is_runnig()
    validate_log_directory_exists(os.environ["LOG_COLL_PATH"])

    if not args.skip_init:
        run_npm_scripts_from("../scripts/init")

    if not args.skip_compile:
        run_scripts_from("../scripts/compile")

    if not args.skip_docker_build:
        run_scripts_from("../scripts/docker/build")

    if not args.skip_docker_deploy:
        if docker_swarm_is_runnig():
            docker_service_update("../scripts/docker/update")
        else:
            docker_swarm_init(os.environ["DOCKER_SWARM_ADVERTISE_ADDR"])

            docker_stack_deploy(
                "docker-swarm/docker-compose-log-collector.yml", "log"
            )  # noqa E501

            reverse_proxy_service = "reverse_proxy"
            docker_remove_network(reverse_proxy_service)
            docker_create_network(reverse_proxy_service)
            docker_create_config(
                "traefik_toml",
                f"reverse-proxy/{os.environ['REVERSE_PROXY_CONFIG_FILE']}.toml",  # noqa E501
            )
            generate_local_certificates(os.environ["CERTIFICATES_DIR"])
            docker_create_secret(
                "nodejs_root_crt",
                f"{os.environ['CERTIFICATES_DIR']}/nodejs.root.crt",  # noqa E501
            )
            docker_create_secret(
                "nodejs_crt", f"{os.environ['CERTIFICATES_DIR']}/nodejs.crt"
            )
            docker_create_secret(
                "nodejs_key", f"{os.environ['CERTIFICATES_DIR']}/nodejs.key"
            )
            docker_stack_deploy(
                "docker-swarm/docker-compose-reverse-proxy.yml",
                reverse_proxy_service,  # noqa E501
            )

            nodejs_service = "nodejs"
            docker_remove_network(nodejs_service)
            docker_create_network(nodejs_service)
            docker_stack_deploy(
                "docker-swarm/docker-compose-nodejs.yml", nodejs_service
            )


if __name__ == "__main__":
    main()
