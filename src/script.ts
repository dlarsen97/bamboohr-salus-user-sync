import { getSalus } from "./salus/init";
import { bamboohr } from "./bamboohr/init";

// push users from bamboohr to salus users

// pull bamboohr users
// pull salus users

// match bamboo users to salus user using the employee number



async function main() {

    const salus = await getSalus();
    console.log(await salus.search_v1_user__get({ limit: 5 }))
}
main()