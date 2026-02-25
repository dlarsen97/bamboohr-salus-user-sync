import bamboohr from '@api/bamboohr';
import "dotenv/config"
const api_key = process.env.API_KEY;

if (!api_key) {
    throw new Error("API key doesn't exist")
}

bamboohr.auth(api_key, "x")

bamboohr.server('https://stacywitbeck.bamboohr.com')


export { bamboohr }

if (require.main === module) {
    // getEmployeesList works, but listTrainingTypes doesn't work, permissions issue TODO: get with Linda and fix permissions issue
    bamboohr.getEmployeesList({ 'page[limit]': '50' })
        .then(({ data }) => console.log(data))
        .catch(err => console.error(err));
    // bamboohr.listTrainingTypes().then((data => console.log(data))).catch(error => console.error(error))
}