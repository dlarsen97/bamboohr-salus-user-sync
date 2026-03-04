import bamboohr from '@api/bamboohr';
import "dotenv/config"
const api_key = process.env.API_KEY;

if (!api_key) {
    throw new Error("API key doesn't exist")
}

bamboohr.auth(api_key, "x")

bamboohr.server('https://stacywitbeck.bamboohr.com')


export { bamboohr }

async function withRetry<T>(fn: () => Promise<T>, retries = 4, baseDelayMs = 500): Promise<T> {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn()
        } catch (err: any) {
            if (attempt === retries) throw err
            const delay = baseDelayMs * 2 ** attempt
            console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, err?.message ?? err)
            await new Promise(res => setTimeout(res, delay))
        }
    }
    throw new Error('unreachable')
}

export function listEmployeeTrainings(employeeId: number) {
    return withRetry(() => bamboohr.listEmployeeTrainings({ employeeId }))
}

const EMPLOYEE_FIELDS = [
    "eeid",
    "firstName",
    "lastName",
    "employeeNumber",
    "dateOfBirth",
    "hireDate",
    // "homeEmail",        // permission restricted // Jeff said ignore it
    "email",           // work email, 
    // "customField4318", // secondary work email, // permission restricted
    "homePhone",
    "mobilePhone",
    "workPhone",        // permission restricted
    // "customField5886", // alternate home phone // permission restrictted
    "jobInformationLocation",
    //UNSUER ABOUT DUPLICATES


    //DOESN"T INTRODUCE DUPLICATES BUT IT REALLY SHOULD SO IT'S USELESS
    // "completedTrainingCategory",
    // "completedTrainingDate",
    // "completedTrainingCost",
    // "completedTrainingCredits",
    // "completedTrainingHours",
    // "completedTrainingInstructor",
    // "completedTrainingNotes",
    // "completedTrainingName",

    // ALL NULL
    // "trainingCompletedDate",
    // "trainingDueDate",
    // "trainingExpirationDate",
    // "trainingName",

    // AFTER THIS POINT THESE FIELDS INTRODUCE DUPLICATES
    // "emergencyContactName",
    // "emergencyContactMobilePhone",
    // "emergencyContactHomePhone",
    // "emergencyContactWorkPhone",
];

export type BambooEmployee = {
    eeid: string | null;
    emergencyContactName: string | null;
    firstName: string | null;
    lastName: string | null;
    employeeNumber: string | null;
    dateOfBirth: string | null;
    hireDate: string | null;
    jobInformationLocation: string | null;
    emergencyContactMobilePhone: string | null;
    emergencyContactHomePhone: string | null;
    emergencyContactWorkPhone: string | null;
    homeEmail: string | null;
    email: string | null;           // work email
    customField4318: string | null; // secondary work email
    homePhone: string | null;
    mobilePhone: string | null;
    workPhone: string | null;
    customField5886: string | null; // alternate home phone
};

export async function getEmployeesDataset() {
    const results: BambooEmployee[] = [];
    let page = 1;
    let totalPages = 1;

    do {
        const { data } = await bamboohr.getDataFromDataset(
            {
                fields: EMPLOYEE_FIELDS,
                filters: {
                    match: "all",
                    filters: [
                        { field: "status", operator: "includes", value: ["Active"] },
                        { field: "employeeNumber", operator: "not_empty" }
                    ],
                },
            },
            { datasetName: 'employee', page: page, page_size: 1000 }
        );
        results.push(...(data.data ?? []) as BambooEmployee[]);
        totalPages = data.pagination?.total_pages!
        page = data.pagination?.current_page!
        console.log(`Fetched page ${page}/${totalPages} (${data.data?.length ?? 0} employees)`);
        page++;
    } while (page <= totalPages);

    return results;
}

if (require.main === module) {
    // getEmployeesDataset().then(employees => console.log(`Total employees: ${employees.length}`)).catch(console.error);
    bamboohr.getDataFromDataset({ fields: EMPLOYEE_FIELDS }, { datasetName: 'employee', page: 2, page_size: 2 }).then(asdf => console.log(asdf.data.data))
}
export type training = {
    id: string;
    employeeId: string;
    completed: string;
    notes: string | null;
    type: string;
}
export type trainingDef = {
    id: string,
    name: string,
    renewable: boolean,
    frequency: string,
    dueFromHireDate: never[] | {
        unit: string,
        amount: string,
    },
    required: boolean,
    category: {
        id: string,// number
        name: string,
    },
    linkUrl: string,
    description: string,
    allowEmployeesToMarkComplete: boolean,

}
/*



fetch("https://stacywitbeck.bamboohr.com/employees/46845/training/filter", {
  "headers": {
    "accept": "*\/*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Not:A-Brand\";v=\"99\", \"Microsoft Edge\";v=\"145\", \"Chromium\";v=\"145\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-csrf-token": "7547557869779b4b68042fd19565c30884fef7c2171245f9173ef36d643c57f35c4a77b9f28814e1e2d39bb1f6612bd94e8a7a96e4ffdc2fdf6f7d17b4cdb516",
    "x-requested-with": "XMLHttpRequest",
    "cookie": "trusted_browser=d5ca0bc387abc9499f174e4588d9732602f30fff54c12132427043fa69fd93aa; acceptCookies=siteWideCookieAccepted; lluid=5891; llcid=184; bhr_features=eyJzdWJzY3JpYmVyIjp0cnVlLCJiaHJfdXNlciI6ZmFsc2UsInF1aWNrc3RhcnQiOmZhbHNlLCJpc19hZG1pbiI6ZmFsc2UsImxsdWlkIjoiNTg5MSIsImxsY2lkIjoiMTg0In0=; _gcl_au=1.1.529551391.1770914904; _cq_duid=1.1771601124.qSvNMKXuA4afun1L; __q_state_DiSAmd4FRuyr1F1w=eyJ1dWlkIjoiMmVmZDYwN2UtZDFiNi00MTBiLTgyNGYtYzgyOGYwZjQwY2YyIiwiY29va2llRG9tYWluIjoiYmFtYm9vaHIuY29tIiwibWVzc2VuZ2VyRXhwYW5kZWQiOmZhbHNlLCJwcm9tcHREaXNtaXNzZWQiOmZhbHNlLCJjb252ZXJzYXRpb25JZCI6IjE4NTQxNTM3MzkwNDUxNTIzNzkifQ==; _cfuvid=GBYdyiL1T5wDx1agqBGeAkOys9f2i2V2d9.iYWysPp0-1772465815043-0.0.1.1-604800000; PHPSESSID=zxvBjQcH%2CPA9%2Ct9-J9tRShu0QzDGQNPP; llfn=Derek; lluidh=25f33d99d0c2eb648f93a3c9e12693092cde9d69b964159cc50bbd15a886a3ce; lluidt=1775076029; _dd_s=rum=0&expire=1772488552149",
    "Referer": "https://stacywitbeck.bamboohr.com/employees/training/?id=46845&page=1265"
  },
  "body": "year=all",
  "method": "POST"
});


*/