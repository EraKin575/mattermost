# Mattermost Project Setup

This README provides the steps to clone and set up the Mattermost project with Keploy.

## Cloning the Repository

First, clone the Mattermost repository from GitHub:
git clone https://github.com/EraKin575/mattermost.git
cd mattermost

shell
Copy code

## Setting up the Project

Change to the server folder:
cd server

csharp
Copy code

## Running the Project

Run the project with Keploy:
keploy record -c "make run-server" --debug

csharp
Copy code

## Setting up the Webapp

Open a new terminal and navigate to the webapp directory:
cd webapp

shell
Copy code

## Running the Webapp

Run the webapp: