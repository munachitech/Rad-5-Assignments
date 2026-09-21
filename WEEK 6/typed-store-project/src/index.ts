import { runCli } from "./cli";
import { seedSampleData } from "./state";

seedSampleData();
runCli(process.argv.slice(2));
