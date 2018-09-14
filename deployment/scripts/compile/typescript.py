#!/usr/bin/env python3

import logging
import os
import sys
from subprocess import Popen, PIPE

logging.basicConfig(
    level=logging.DEBUG,
    format="[%(asctime)s] - %(levelname)s - %(message)s",
    datefmt="%I:%M:%S %p",
)


def script_execution_path(path):
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(path)
    logging.info(f"working directory: {os.getcwd()}")


def npm_compile():
    logging.info("npm compile...")
    process = Popen(
        ["npm", "run", "compile"],
        stdout=PIPE,
        stderr=PIPE,
        universal_newlines=True,  # noqa E501
    )
    _, err = process.communicate()
    if process.returncode == 0:
        logging.info("npm compiled successfully")
    else:
        logging.error(err)
        sys.exit()


def main():
    script_execution_path("../../../typescript/")
    npm_compile()


if __name__ == "__main__":
    main()
