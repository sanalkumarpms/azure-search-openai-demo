# Backend Changes

## app/backend/app.py
### update the method to return a response
@bp.route("/chat", methods=["POST"])
async def chat():
    ...
        if isinstance(result, dict):
            return jsonify(result)
        else:
            response = await make_response(format_as_ndjson(result))
            response.timeout = None  # type: ignore
            return response
    except Exception as error:
        ...
    ---
### Add new method
@bp.route("/log_feedback", methods=["POST"])
async def log_feedback():
    if not request.is_json:
        return jsonify({"error": "request must be json"}), 415
    request_json = await request.get_json()
 
    auth_helper = current_app.config[CONFIG_AUTH_CLIENT]
    # auth_claims = await auth_helper.get_auth_claims_if_enabled(request.headers)
    try:
        impl = current_app.config[CONFIG_CHAT_APPROACH]
        impl.log_feedback(request_json)
        return jsonify({"success": "Logging feedback method called successfully"})
    except Exception as e:
        logging.exception("Exception in /chat")
        return jsonify({"error": str(e)}), 500

## app/backend/approaches/chatreadretrieveread.py
### Add a new method

    def log_feedback(self, request_json) -> None:
        feedback = request_json["feedback"]
        id = request_json["id"]
        print(id)
        session_id = id.split("-", 3)[3]
        print(f"Logging user {feedback} for id ({id}) : ")
        print("***session_id", session_id)
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
 
            log_entry = container.read_item(item=id, partition_key=session_id)
            log_entry['feedback'] = feedback
            container.replace_item(item=log_entry, body=log_entry)
 
        except exceptions.CosmosHttpResponseError as e:
            print('\nlog feedback has caught an error. {0}'.format(e.message))
 
        finally:
                print("\nlog feedback done")

## Modify log_chat method
...
        except exceptions.CosmosHttpResponseError as e:
            print('\nlog chat history has caught an error. {0}'.format(e.message))
            return '-1'
 
        finally:
                print("\nlog chat history done")
                return log_entry['id']
-----------------------------------------------------------------------------------------------
#Front end

## app/frontend/src/pages/chat/Chat.tsx
### Add logFeedback to Import
import {
    ...
    ChatHistory,
    logFeedback
} from "../../api";

### Update the following code to include changes as below


                                        <div className={styles.chatMessageGpt}>
                                            <Answer
                                                ...
                                                onFollowupQuestionClicked={q => makeApiRequest(q)}
                                                onThumpsUpClicked={() => markResponsePositive()}
                                                onThumpsDownClicked={ans => markResponseNegative(ans)}
                                                showFollowupQuestions={useSuggestFollowupQuestions && answers.length - 1 === index}
                                                isLast={answers.length - 1 === index}
                                                userFeedback={userFeedback}
                                            />
                                        </div>
                                    </div>
                                ))}
                            {!isStreaming &&
                                answers.map((answer, index) => (
                                    <div key={index}>
                                        <UserChatMessage message={answer[0]} />
                                        <div className={styles.chatMessageGpt}>
                                            <Answer
                                                ...
                                                onFollowupQuestionClicked={q => makeApiRequest(q)}
                                                onThumpsUpClicked={() => markResponsePositive()}
                                                onThumpsDownClicked={ans => markResponseNegative(ans)}
                                                showFollowupQuestions={useSuggestFollowupQuestions && answers.length - 1 === index}
                                                isLast={answers.length - 1 === index}
                                                userFeedback={userFeedback}
                                            />
                                        </div>


### Add the following methods

    const markResponsePositive = async () => {
        try {
            const token = client ? await getToken(client) : undefined;
            logFeedback(lastResponseId, "Positive", token?.accessToken);
            userFeedback = 1;
            setFeedback(1);
        } catch (e) {
            setError(e);
        }
        return true;
    };
    const markResponseNegative = async (ans: any) => {
        try {
            console.log(ans);
            const token = client ? await getToken(client) : undefined;
            logFeedback(lastResponseId, "Negative", token?.accessToken);
            userFeedback = 2;
            setFeedback(2);
        } catch (e) {
            setError(e);
        }
        return true;
    };

## app/frontend/src/api/api.ts
### Add the following method

export async function logFeedback(id: string, feedback: string, idToken: string | undefined): Promise<Response> {
    const url = "log_feedback";
    return await fetch(`${BACKEND_URI}/${url}`, {
        method: "POST",
        headers: getHeaders(idToken),
        body: JSON.stringify({
            id: id,
            sessionId: sessionId,
            feedback: feedback
        })
    });
}

## app/frontend/src/components/Answer/Answer.tsx
### update include following changes

interface Props {
    ...
    onFollowupQuestionClicked?: (question: string) => void;
    onThumpsUpClicked: () => void;
    onThumpsDownClicked: (ans: any) => void;
    showFollowupQuestions?: boolean;
    isLast?: boolean;
    userFeedback: number;
}

---

export const Answer = ({
    ...
    onFollowupQuestionClicked,
    onThumpsUpClicked,
    onThumpsDownClicked,
    showFollowupQuestions,
    isLast,
    userFeedback

---
                        <IconButton
                            ...
                            onClick={() => onSupportingContentClicked()}
                        />                          
                        <span hidden={!isLast}>
                            <IconButton
                                style={{ color: "black" }}
                                iconProps={{ iconName: "Like" }}
                                title="Helpful Response"
                                ariaLabel="Helpful Response"
                                onClick={() => onThumpsUpClicked()}
                                disabled={userFeedback === 1}
                            />
                        </span>
                        <span hidden={!isLast}>
                            <IconButton
                                style={{ color: "black" }}
                                iconProps={{ iconName: "Dislike" }}
                                title="Response Not Helpful"
                                ariaLabel="Response Not Helpful"
                                onClick={e => onThumpsDownClicked(e)}
                                disabled={userFeedback === 2}
                            />