import TextEditor from "./TextEditor"
import DiffView from "./DiffView";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom"
import { v4 as uuidV4 } from "uuid"

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <Redirect to={`/documents/${uuidV4()}`} />
        </Route>
        <Route path="/documents/:id">
          <TextEditor />
        </Route>
        <Route path="/diff/:id/">
          <DiffView />
        </Route>
      </Switch>
    </Router>
  )
}

export default App
