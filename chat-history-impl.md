# Cosmos DB
- Create a Cosmosdb Resource, a database and a container
  Note Down
  - CosmosDB URL
  - Database Name
  - ContainerName
  - Key

---  
# Environment
- File: .azure/<environment>/.env
    COSMOSDB_HOST="https://<cosmosdb-resource-name>.documents.azure.com:443/"
    COSMOSDB_DATABASE_ID="<CosmosDB Database Name>"
    COSMOSDB_CONTAINER_ID="<CosmosDB Container Name>"
    COSMOSDB_MASTER_KEY="<CosmosDB Key>"

# Backend Changes
## API
- File : app/backend/app.py
### New Method
@bp.route("/log_chat", methods=["POST"])
async def log_chat():
    if not request.is_json:
        return jsonify({"error": "request must be json"}), 415
    request_json = await request.get_json()
 
    auth_helper = current_app.config[CONFIG_AUTH_CLIENT]
    # auth_claims = await auth_helper.get_auth_claims_if_enabled(request.headers)
    try:
        impl = current_app.config[CONFIG_CHAT_APPROACH]
        response = impl.log_chat(request_json)
        return response
    except Exception as e:
        logging.exception("Exception in /chat")
        return jsonify({"error": str(e)}), 500
------------------------------------------------        
## Implementation
  - File : app/backend/approaches/chatreadretrieveread.py
  ### Import
    import azure.cosmos.cosmos_client as cosmos_client
    import azure.cosmos.exceptions as exceptions
    from azure.cosmos.partition_key import PartitionKey
    import datetime
    import random
    import os
### New method
    def log_chat(self, request_json) -> None:
        HOST =  os.environ["COSMOSDB_HOST"]
        MASTER_KEY =  os.environ["COSMOSDB_MASTER_KEY"]
        DATABASE_ID =  os.environ["COSMOSDB_DATABASE_ID"]
        CONTAINER_ID =  os.environ["COSMOSDB_CONTAINER_ID"]
        client = cosmos_client.CosmosClient(HOST, {'masterKey': MASTER_KEY}, user_agent="OpenAIChatBot", user_agent_overwrite=True)
        try:
            try:
                db = client.create_database(id=DATABASE_ID)
                print('Database with id \'{0}\' created'.format(DATABASE_ID))
 
            except exceptions.CosmosResourceExistsError:
                db = client.get_database_client(DATABASE_ID)
                print('Database with id \'{0}\' was found'.format(DATABASE_ID))
 
            # setup container for this sample
            try:
                container = db.create_container(id=CONTAINER_ID, partition_key=PartitionKey(path='/sessionID'))
                print('Container with id \'{0}\' created'.format(CONTAINER_ID))
 
            except exceptions.CosmosResourceExistsError:
                container = db.get_container_client(CONTAINER_ID)
                print('Container with id \'{0}\' was found'.format(CONTAINER_ID))
 
            session_id = str(datetime.date.today()) + "-" + request_json["sessionId"]
 
            current_time = datetime.datetime.now();
            log_entry = {'id' : current_time.isoformat() + "-" + session_id,
                    'datetime' : current_time.strftime("%Y-%m-%d %H:%M:%S"),
                    'sessionID' : session_id,
                    'user_input' : request_json["question"],
                    'model_response' : request_json["response"],
                    'model_response_time' : request_json["responseTime"],
                    'feedback' : 'No Value',
                    'error_flag' : request_json["errorFlag"]
                    }
            container.create_item(body=log_entry)
 
        except exceptions.CosmosHttpResponseError as e:
            print('\nlog chat history has caught an error. {0}'.format(e.message))
            return '-1'
 
        finally:
                print("\nlog chat history done")
                return log_entry['id']

------------------------------------------

# Frontend Changes
## API
- File: frontend/src/api/api.ts
### New variable (after import)
const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
### New method
export async function logChatApi(historyRec: ChatHistory, idToken: string | undefined): Promise<Response> {
    const url = "log_chat";
    return await fetch(`${BACKEND_URI}/${url}`, {
        method: "POST",
        headers: getHeaders(idToken),
        body: JSON.stringify({
            sessionId: sessionId,
            question: historyRec.question,
            response: historyRec.response,
            responseTime: historyRec.responseTime,
            errorFlag: historyRec.errorFlag
        })
    });
}

export type ChatHistory = {
    sessionId: string,
    question: string,
    response: string,
    responseTime: number,
    errorFlag: string
}

## pages
- File: frontend/src/pages/Chat.tsx
### import (update the existing to include ChatHistory)
import { chatApi, RetrievalMode, ChatAppResponse, logChatApi, ChatAppResponseOrError, ChatAppRequest, ResponseMessage, ChatHistory } from "../../api";
### Update method makeApiRequest() to call logChat(). See the comment "//<<- new line " below

            if (shouldStream) {
                const parsedResponse: ChatAppResponse = await handleAsyncRequest(question, answers, setAnswers, response.body);
                setAnswers([...answers, [question, parsedResponse]]);
                const responseFinishTime = new Date();
                const responseTime = (responseFinishTime.getTime() - responseRequestTime.getTime()) / 1000;
                logChat(question, parsedResponse, responseTime, "N");  //<<- new line
            } else {
                const parsedResponse: ChatAppResponseOrError = await response.json();
                if (response.status > 299 || !response.ok) {
                    throw Error(parsedResponse.error || "Unknown error");
                }
                setAnswers([...answers, [question, parsedResponse as ChatAppResponse]]);
                const responseFinishTime = new Date();
                const responseTime = (responseFinishTime.getTime() - responseRequestTime.getTime()) / 1000;
                if (parsedResponse) {
                    // Log error
                    logChat(question, parsedResponse as ChatAppResponse, responseTime, "Y"); //<<- new line
                }
            }
### New Method
    const logChat = async (question: string, response: ChatAppResponse, responseTime: number, errorFlag: string) => {
        const token = client ? await getToken(client) : undefined;
        const historyRec: ChatHistory = {
            question: question, 
            response: response.choices[0].message.content, 
            responseTime: responseTime, 
            errorFlag: errorFlag,
            sessionId: ""
        };
        logChatApi(historyRec, token?.accessToken).then (function(response) {
            return response.text();
          }).then(function(data) {
            lastResponseId = data;
          });
    };

# Python packages
- File: app/backend/requirements.txt
## Add after azure-storage-blob
azure-cosmos==4.3.1  

## To test locally run
pip install azure-cosmos=4.3.1

# Deploy
## Add the configuration variables to the deployed App Service --> Configuration
    COSMOSDB_HOST="https://<cosmosdb-resource-name>.documents.azure.com:443/"
    COSMOSDB_DATABASE_ID="<CosmosDB Database Name>"
    COSMOSDB_CONTAINER_ID="<CosmosDB Container Name>"
    COSMOSDB_MASTER_KEY="<CosmosDB Key>"