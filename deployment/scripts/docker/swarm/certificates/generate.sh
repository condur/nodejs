#!/bin/sh
cd "${0%/*}" # change to the directory this script is in
cd ../../../../config/reverse-proxy

certdir="certificates"
host=${HOST_NAME:-nodejs.dev}

# setup a CA key
if [ ! -f "$certdir/ca-key.pem" ]; then
  openssl genrsa -out "${certdir}/ca-key.pem" 4096
fi

# setup a CA cert
openssl req -new -x509 -days 365 \
  -subj "/CN=Local CA" \
  -key "${certdir}/ca-key.pem" \
  -sha256 -out "${certdir}/nodejs.root.crt"

# setup a host key
if [ ! -f "${certdir}/nodejs.key" ]; then
  openssl genrsa -out "${certdir}/nodejs.key" 2048
fi

# create a signing request
extfile="${certdir}/extfile"
openssl req -subj "/CN=${host}" -new -key "${certdir}/nodejs.key" \
  -out "${certdir}/${host}.csr"
echo "subjectAltName = IP:127.0.0.1,DNS:${host}" > ${extfile}

# create the host cert
openssl x509 -req -days 365 \
  -in "${certdir}/${host}.csr" -extfile "${certdir}/extfile" \
  -CA "${certdir}/nodejs.root.crt" -CAkey "${certdir}/ca-key.pem" -CAcreateserial \
  -out "${certdir}/nodejs.crt"

# cleanup
if [ -f "${certdir}/${host}.csr" ]; then
  rm -f -- "${certdir}/${host}.csr"
fi
if [ -f "${extfile}" ]; then
  rm -f -- "${extfile}"
fi
