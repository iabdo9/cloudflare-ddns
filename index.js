const fetch = require("node-fetch")
require("dotenv").config()
const zones = require("./config.json")

setTimeout(async function () {
    const ip = await fetch("https://api.ipify.org?format=json").then(res => res.text())

    zones.forEach(async zone => {
        console.log(process.env.readAuthKey)
        const dns_records = await fetch(`https://api.cloudflare.com/client/v4/zones/${zone.id}/dns_records?type=A`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${process.env.readAuthKey}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json())
        console.log(dns_records)

        dns_records.result.forEach(async record => {
            if (zone.exclude.includes(record.name)) return
            const newRecord = await fetch(`https://api.cloudflare.com/client/v4/zones/${zone.id}/dns_records/${record.id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${process.env.editAuthKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    type: "A",
                    name: record.name,
                    content: ip,
                    ttl: 1,
                    proxied: true
                })
            }).then(res => res.json())
            if (newRecord.success !== false) {
                console.log(`Record ${newRecord.result.name} updated to ${ip} At ${new Date(newRecord.result.modified_on).toLocaleTimeString()}`)
            }
        })
    })
}, 1000)
