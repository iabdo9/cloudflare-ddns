const fetch = require("node-fetch")
require("dotenv").config()

setInterval(async function () {
    const ip = await fetch("https://api.ipify.org?format=json").then(res => res.json())

    const dns_records = await fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.zoneID}/dns_records?type=A`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${process.env.readAuthKey}`,
            "Content-Type": "application/json"
        }
    }).then(res => res.json())

    dns_records.result.forEach(async record => {
        const newRecord = await fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.zoneID}/dns_records/${record.id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${process.env.editAuthKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                type: "A",
                name: record.name,
                content: ip.ip,
                ttl: 1,
                proxied: true
            })
        }).then(res => res.json())
        console.log(`Record ${newRecord.result.name} updated to ${ip.ip} At ${new Date(newRecord.result.modified_on).toLocaleTimeString()}`)
    })
}, 1000 * 60 * 5)
