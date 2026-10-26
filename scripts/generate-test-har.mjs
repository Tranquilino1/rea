import { environmentStateHar } from "../tests/fixtures/historicalHar.ts";
import { writeFileSync } from "node:fs";

const har = environmentStateHar();
writeFileSync("test-app.har", JSON.stringify(har, null, 2));
console.log("Wrote test-app.har with", har.log.entries.length, "entries");
