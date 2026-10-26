#!/usr/bin/env node
import { startStudio } from "../src/studio/server.mjs";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
startStudio(port);
