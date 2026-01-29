# Manual Testing Guide for Fortclaw

To verify the "Clawed" features (core agent capabilities) manually, you will need to run the **Gateway** (backend) and a **Client** (TUI or CLI) to talk to it.

## 1. Start the Gateway (Backend)
Open a new terminal window or tab in the root configuration directory (`/Users/shubhambadola/Documents/codebase/public/Fortclaw`).

Run the following command to start the backend server in development mode (skips real WhatsApp/Discord connections for safety):

```bash
npm run gateway:dev
```

*Wait until you see "Gateway listening on ws://127.0.0.1:18789" (or similar).*

## 2. Interact with the Agent

You have two options for interaction:

### Option A: Interactive TUI (Text User Interface)
Open **another** terminal window/tab and run:

```bash
npm run tui
```
*   This opens a chat interface in your terminal.
*   Type `Hello, are you working?` and hit Enter.
*   The agent should reply.
*   Type `/status` to see session details.

### Option B: CLI One-Off Commands
If you prefer single commands, use the `fortclaw` CLI tool from a separate terminal:

**Send a prompt:**
```bash
# Ask a question
npm run fortclaw -- agent --message "What is the capital of France?" --thinking low

# Check system status
npm run fortclaw -- doctor
```

## 3. Verify Security Features
You can also test the security features we implemented:

*   **Security Health Check**: If you typically run `npm run dev` in `security-ui`, visit [http://localhost:5200/health](http://localhost:5200/health) to see the Gateway's status (it should be "Online" when `gateway:dev` is running).

## Troubleshooting
*   **Port In Use**: If `gateway:dev` fails saying port 18789 is in use, check if another instance of Fortclaw is running.
*   **Connection Refused**: Ensure the Gateway is actually running before starting the TUI.
*   **Port Mismatch**: The development gateway (`gateway:dev`) often starts on a random port (e.g., 19001). Check the gateway output line: `[gateway] listening on ws://127.0.0.1:XXXXX`.
    *   Run the TUI with that URL: `npm run tui -- --url ws://127.0.0.1:XXXXX`
*   **Auth Token**: If you started the gateway with a token (e.g., `--token test`), you must pass it to the TUI as well:
    ```bash
    npm run tui -- --url ws://127.0.0.1:XXXXX --token test
    ```
