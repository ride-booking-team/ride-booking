import {startDockerPostgresql} from "./docker-postgresql-manager.js";
import teardown from "./teardown-postgresql-docker.js";


const setup = async (): Promise<void> => {
    try {
        await startDockerPostgresql();
    } catch (error) {
        await teardown();
    }
};

export default setup;
