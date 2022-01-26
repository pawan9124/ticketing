import nats, { Stan } from 'node-nats-streaming';

/* 
    Why are we creating this class is to make the object initialized be shared to the different
    files
    like-> mongoose.connect(), and then same mongoose object is used to access the data accross diffrent files
    How it worked ---> you make a class and defined function to connect, when the object get connected, same object can 
    be used on other file
*/

class NatsWrapper {

    private _client?: Stan; //? is used ot make it opitonal to fix the not initialized error

    //we are getting the _client access to the new router using the getter property
    get client() {
        //if this._client is not defined then the client would not be returned.
        if (!this._client) {
            throw new Error("Can't access to the client before connection");
        }
        return this._client;
    }

    connect(clusterId: string, clientId: string, url: string) {
        this._client = nats.connect(clusterId, clientId, { url });
        return new Promise<void>((resolve, reject) => {
            this.client.on('connect', () => {
                console.log("Connected to NATS");
                resolve();
            });

            this.client.on('error', (err) => {
                reject(err);
            });
        });
    }
}

export const natsWrapper = new NatsWrapper();