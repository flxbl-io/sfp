FROM ubuntu:24.04


ARG SF_CLI_VERSION=2.75.5
ARG BROWSERFORCE_VERSION=4.5.0
ARG SFDMU_VERSION=4.37.0
ARG GIT_COMMIT
ARG NODE_MAJOR=22
ARG SFP_VERSION

LABEL org.opencontainers.image.description "sfp is a build system for modular development in Salesforce."
LABEL org.opencontainers.image.licenses "MIT"
LABEL org.opencontainers.image.url "https://github.com/flxbl-io/sfp"
LABEL org.opencontainers.image.documentation "https://docs.flxbl.io/sfp"
LABEL org.opencontainers.image.revision $GIT_COMMIT
LABEL org.opencontainers.image.vendor "Flxbl"
LABEL org.opencontainers.image.source "https://github.com/flxbl-io/sfp"
LABEL org.opencontainers.image.title "Flxbl sfp docker image - December 24"


ENV DEBIAN_FRONTEND=noninteractive


RUN ln -sf bash /bin/sh


RUN apt-get update && \
    apt-get -y install --no-install-recommends \
    jq \
    zip \
    unzip \
    curl \
    wget \
    git \
    tzdata \
    openjdk-21-jre-headless \
    libgtk2.0-0t64 \
    libgtk-3-0t64 \
    libgbm-dev \
    libnotify-dev \
    libnss3 \
    libxss1 \
    libasound2t64 \
    libxtst6 \
    xauth \
    xvfb \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-khmeros \
    fonts-kacst \
    fonts-freefont-ttf \
    dbus \
    dbus-x11 \
    chromium-bsu \
    chromium-driver && \
    apt-get autoremove -y && \
    apt-get clean -y && \
    rm -rf /var/lib/apt/lists/*

# Set timezone to UTC
ENV TZ=UTC
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Install Node.js and build dependencies in one layer
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get -y install --no-install-recommends \
      make \
      ca-certificates \
      gcc-14 g++-14 \
      gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get -y install --no-install-recommends nodejs \
    && update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-14 100 \
       --slave /usr/bin/g++ g++ /usr/bin/g++-14 \
       --slave /usr/bin/gcov gcov /usr/bin/gcov-14 \
    && ln -s /usr/bin/gcc /usr/bin/cc \
    && apt-get autoremove --assume-yes \
    && apt-get clean --assume-yes \
    && rm -rf /var/lib/apt/lists/* 

# install yarn
RUN npm install --global yarn --omit-dev \
    && npm cache clean --force

# Install SF cli and sfpowerscripts
RUN npm install --global --omit=dev \
    @salesforce/cli@${SF_CLI_VERSION} \
    @flxbl-io/sfp@${SFP_VERSION} \
    && npm cache clean --force



# Set XDG environment variables explicitly so that GitHub Actions does not apply
# default paths that do not point to the plugins directory
# https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html
ENV XDG_DATA_HOME=/sf_plugins/.local/share \
    XDG_CONFIG_HOME=/sf_plugins/.config  \
    XDG_CACHE_HOME=/sf_plugins/.cache \
    JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64/ \
    PUPPETEER_CACHE_DIR=/root/.cache/puppeteer


# Create symbolic link from sh to bash
# Create isolated plugins directory with rwx permission for all users
# Azure pipelines switches to a container-user which does not have access
# to the root directory where plugins are normally installed
RUN mkdir -p $XDG_DATA_HOME && \
    mkdir -p $XDG_CONFIG_HOME && \
    mkdir -p $XDG_CACHE_HOME && \
    chmod -R 777 sf_plugins && \
    export JAVA_HOME && \
    export XDG_DATA_HOME && \
    export XDG_CONFIG_HOME && \
    export XDG_CACHE_HOME



# Install sfdx plugins
RUN echo 'y' | sf plugins:install sfdx-browserforce-plugin@${BROWSERFORCE_VERSION} \
    && echo 'y' | sf plugins:install sfdmu@${SFDMU_VERSION} \
    && echo 'y' | sf plugins:install @salesforce/sfdx-scanner@4.7.0 \
    && yarn cache clean --all 

# Set some sane behaviour in container
ENV SF_CONTAINER_MODE=true
ENV SF_DISABLE_AUTOUPDATE=true
ENV SF_DISABLE_TELEMETRY=true
ENV SF_USE_GENERIC_UNIX_KEYCHAIN=true
ENV SF_USE_PROGRESS_BAR=false
ENV SF_DNS_TIMEOUT=60000
ENV SF_SKIP_VERSION_CHECK=true
ENV SF_SKIP_NEW_VERSION_CHECK=true

WORKDIR /root



# clear the entrypoint for azure
ENTRYPOINT []
CMD ["/bin/sh"]
