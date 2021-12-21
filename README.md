<h1 align="center">Multi-Tenant microservice architecture</h1>

## Description

Note: The current architecture repo is WIP.

It is a backend base for building microservice project. This is designed to be extremely slim and scalable, with distributed data request and process handling, built from the ground up for production use. It comes with Multi-Tenancy support, following different multi-tenancy database strategy to identify your tenants. The goal is to ease the initial development and setting up of a scalable project.

## Features

Software features

- ✅ CQRS
- ✅ Software as a Service
- ✅ OAuth2 Authentication (Google, Github, Facebook) REST
- ✅ GRPC Microservice
- ✅ Emailing Queue
- ✅ Multi Tenancy
- ✅ Security
- ✅ Service Discovery (Default on Consul)
- ❌ (WiP) Documentation

## Software stack

|                                   | Required                                                                                                                                                                                                    | Optional |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `Store and cache`                 | [MongoDB (Database)](https://www.mongodb.com/)                                                                                                                                                              |
| `Stack and frameworks`            | [NestJS (Server Framework)](https://nestjs.com), [NodeJS (System runtime)](https://nodejs.org), [Typescript](https://www.typescriptlang.org), [Express JS](https://expressjs.com), [GRPC](https://grpc.io/) |
| `Deployment and containerization` | [Docker](https://www.docker.com/)                                                                                                                                                                           |
| `Service Registry`                | [Consul](https://consul.io/)                                                                                                                                                                                |
