[![Continuous Integration](https://github.com/alessandro-marcantoni/mas-web-based-ide-organisation/actions/workflows/ci.yaml/badge.svg)](https://github.com/alessandro-marcantoni/mas-web-based-ide-organisation/actions/workflows/ci.yaml)
[![Release and Deliver](https://github.com/alessandro-marcantoni/mas-web-based-ide-organisation/actions/workflows/cd.yaml/badge.svg)](https://github.com/alessandro-marcantoni/mas-web-based-ide-organisation/actions/workflows/cd.yaml)

# Web IDE for Organizations in Hypermedia MAS

This repository is coinceived as an extension of the [intelliot-hypermas-explorer](https://github.com/Interactions-HSG/intelliot-hypermas-explorer) web-based IDE and introduces a visual programming environment for organizations in Hypermedia Multi-Agent Systems.

## Main Concepts

In the current version, it is possible to define _organizational specifications_.

### Structure

The IDE supports the definition of the _organizational structure_ based on __roles__ (adopted by the agents at runtime) that belong to __groups__.  
Roles can be:

- _abstract_: they are not directly enacted by agents, they can thus not be part of groups. However, they can be extended by other roles and they can be assigned goals.
- _concrete_: they can be directly enacted by agents and be part of groups.

### Organizational Goals

The IDE supports the definition of _organizational goals_.
The __goals__ can depend on each other, eventually forming a _dependency graph_.  
Finally, goals can be assigned to one or multiple roles either through _permission_ or _obligation_.

## Running the IDE

The IDE can be run either by:

- cloning the repository
- running ```npm install```
- defining a `.env` file with the variables below
```bash
GENERATE_SOURCEMAP=false
PORT=<PORT>
PUBLIC_URL=/
```
- running ```npm start```

or with Docker using the latest image with the command

```
docker run -p 80:80 --rm -it ghcr.io/alessandro-marcantoni/mas-organization-web-ide:latest
```

## Usage

- Browse to `localhost:<PORT>` in your browser
- Type in the name of your organization
- Select `NEW ORGANIZATION`
- Start defining your organization