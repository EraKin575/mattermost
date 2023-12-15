# Integrate mattermost with keploy



## Installation

clone mattermost
```bash
git clone https://github.com/EraKin575/mattermost.git
```

## Usage

```change directory to server
cd server

# start server with keploy
keploy record -c "make run-server" --debug

# run ui
#change directory to webapp 
cd webapp

# run ui
nvm install
make run

```
