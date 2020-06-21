const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const baseUrl = "https://terminal-api-test.adyen.com/sync";

//set number of payments you want to run
const loop = 100;

//set your terminal serial number
const terminalSN = "V400m-346388542";

//set the time you want to wait between each request
const interval = 15000;

axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.headers.post["X-API-KEY"] = process.env.X_API_KEY;

let response, battery, serviceId, timeStamp, d, data, request, promise;

main();
//while loop is ongoing
async function main() {
    for (let i = 0; i < loop; i++) {
        await diagnosisRequest();

        // //do a payment reqeust
        await paymentRequest();

        // //wait
        console.log("Waiting...");
        await wait(i);
    }
}

async function diagnosisRequest() {
    d = new Date();
    timeStamp = d.toISOString();
    serviceId = Date.now().toString().substring(3);
    //do a post request to get battery info (diagnosis request)
    console.log("sending Diagnosis Request...");
    promise = await
        axios.post(baseUrl,
            {
                SaleToPOIRequest: {
                    MessageHeader: {
                        ProtocolVersion: "3.0",
                        MessageClass: "Service",
                        MessageCategory: "Diagnosis",
                        MessageType: "Request",
                        ServiceID: serviceId,
                        SaleID: "POS",
                        POIID: terminalSN
                    },
                    DiagnosisRequest: {
                        HostDiagnosisFlag: false
                    }
                }
            }).then(res => {
                // console.log(res.data.SaleToPOIResponse.DiagnosisResponse.Response.AdditionalResponse);
                response = res.data.SaleToPOIResponse.DiagnosisResponse.Response.AdditionalResponse;
                battery = response.split("&");
                // console.log(battery[0]);
                data = "timeStamp: " + timeStamp + "\n" + "Terminal: " + terminalSN + "\n" + battery[0] + "\n";
                //write to file with 
                //1) timestamp
                //2) Terminal ID
                //3) battery %
                fs.appendFile('Output.txt', data, (err) => {

                    //     // In case of a error throw err. 
                    if (err) throw err;

                });
                console.log("Finishing Diagnosis Request");
            }).catch(e => {
                console.log(e);
            });
    return promise;
}

async function paymentRequest() {
    console.log("Sending Payment Request...");
    serviceId = Date.now().toString().substring(3);
    request = {
        SaleToPOIRequest: {
            MessageHeader: {
                ProtocolVersion: "3.0",
                MessageClass: "Service",
                MessageCategory: "Payment",
                MessageType: "Request",
                SaleID: "POS",
                ServiceID: serviceId,
                POIID: terminalSN
            },
            PaymentRequest: {
                SaleData: {
                    SaleTransactionID: {
                        TransactionID: "merchantRef",
                        TimeStamp: timeStamp
                    },
                    SaleToAcquirerData: "tenderOption=ReceiptHandler"
                },
                PaymentTransaction: {
                    AmountsReq: {
                        Currency: "USD",
                        RequestedAmount: 0.10
                    }
                }
            }
        }
    }
    promise = await
        axios.post(baseUrl,
            request).then(res => {
                // console.log(res.data.SaleToPOIResponse);

                //write to file raw request
                data = "Raw Request: " + "\n" + JSON.stringify(request, null, 2) + "\n" + "Raw Response: " + "\n" + JSON.stringify(res.data.SaleToPOIResponse, null, 2) + "\n\n\n";
                //write to file raw response
                fs.appendFile('Output.txt', data, (err) => {

                    // In case of a error throw err. 
                    if (err) throw err;

                });
                console.log("Finishing Payment Request...");
            }).catch(e => {
                console.log(e);
            });
    return promise;
}

async function wait(num) {
    promise = await setTimeout(function () {
    }, interval);
    if (num == loop - 1) {
        console.log("Program Complete!");
    }
    return promise;
}