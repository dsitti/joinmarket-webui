FROM python:3.9.7-slim-bullseye

RUN apt-get update \
    && apt-get install -qq --no-install-recommends tini procps vim git iproute2 supervisor \
       curl build-essential automake pkg-config libtool python3-dev python3-pip python3-setuptools libltdl-dev \
    && rm -rf /var/lib/apt/lists/*

ENV REPO https://github.com/JoinMarket-Org/joinmarket-clientserver
ENV REPO_REF master

WORKDIR /src
RUN git clone "$REPO" . --depth=10 --branch "$REPO_REF" && git checkout "$REPO_REF"

RUN ./install.sh --docker-install --disable-secp-check --without-qt

ENV DATADIR /root/.joinmarket
ENV CONFIG ${DATADIR}/joinmarket.cfg
ENV DEFAULT_CONFIG /root/default.cfg
ENV DEFAULT_AUTO_START /root/autostart
ENV AUTO_START ${DATADIR}/autostart
ENV PATH /src/scripts:$PATH

COPY default.cfg "${CONFIG}"

RUN cd /src/scripts \
    && (python wallet-tool.py generate || true) \
    && cp "${CONFIG}" "${DEFAULT_CONFIG}"

WORKDIR /src/scripts

COPY docker-entrypoint.sh .
COPY autostart /root/
COPY supervisor-conf/*.conf /etc/supervisor/conf.d/

# payjoin server
EXPOSE 8080
# obwatch
EXPOSE 62601 
# joinmarketd daemon
EXPOSE 27183
# jmwalletd api
EXPOSE 28183
# jmwalletd websocket
EXPOSE 28283

ENTRYPOINT  [ "tini", "-g", "--", "./docker-entrypoint.sh" ]
