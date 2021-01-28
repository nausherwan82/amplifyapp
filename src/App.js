import React, { useState, useEffect } from 'react';
import './App.css';
import { Auth,Hub, button } from 'aws-amplify';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import Login from "./components/login.component";
import SignUp from "./components/signup.component";

const initialFormState = { username: '', password: '', email:'', authCode: '', formType: 'signUp' }

function App() {
  const [formState, updateFormState] = useState(initialFormState )
  const [user, updateUser] = useState(null)
  useEffect(() => {
    checkUser()
    setAuthListerner()
  },[])

  async function checkUser() {

    try{
      const user = await Auth.currentAuthenticatedUser();
      updateUser(user);
      updateFormState(() => ({...formState, formType:"signedIn"}));
    }
    catch(err)
    {
     // updateUser(null);
    }
  }

  async function setAuthListerner(){
    Hub.listen('auth', (data) => {
      switch (data.payload.event) {
        case 'signOut':
        updateFormState(() => ({...formState, formType:"signUp"}));
            break;
        default: 
            break;
      }
    });
  }

  function onChange(e){
    e.persist();
    updateFormState(() => ({ ...formState, [e.target.name]: e.target.value}));
  }
  const { formType} = formState;
  async function signUp(){
    const { username, password, email } = formState;
    await Auth.signUp({username, password, attributes:{email}});
    updateFormState(() => ({...formState, formType:"confirmSignUp"}));
  }
  async function confirmSignUp(){
    const { username, authCode } = formState;
    await Auth.confirmSignUp( username, authCode );
    updateFormState(() => ({...formState, formType:"signIn"}));
  }
  async function signIn(){
    const { username, password } = formState;
    await Auth.signIn(username, password );
    updateFormState(() => ({...formState, formType:"signedIn"}));
  }

  return (<Router>
    <div className="App">
      <nav className="navbar navbar-expand-lg navbar-light fixed-top">
        <div className="container">
          <Link className="navbar-brand" to={"/sign-in"}>positronX.io</Link>
          <div className="collapse navbar-collapse" id="navbarTogglerDemo02">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <Link className="nav-link" to={"/sign-in"}>Login</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to={"/sign-up"}>Sign up</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="auth-wrapper">
        <div className="auth-inner">
          <Switch>
            <Route exact path='/' component={Login} />
            <Route path="/sign-in" component={Login} />
            <Route path="/sign-up" component={SignUp} />
          </Switch>
        </div>
      </div>
      {
       formType === 'signUp' && (
         <div>
           <input name="username" onChange={onChange} placeholder="username" />
           <input name="password" type="password" onChange={onChange} placeholder="password" />
           <input name="email" onChange={onChange} placeholder="email" />
           <button onClick={signUp}>Sign Up</button>
           <button onClick={() =>
             updateFormState(() => ({...formState, formType:"signIn"}))
             }>Sign In</button>
        </div>
       )
     }
     {
       formType === 'signIn' && (
         <div>
           <input name="username" onChange={onChange} placeholder="username" />
           <input name="password" type="password" onChange={onChange} placeholder="password" />
           <button onClick={signIn}>>Sign In</button>
        </div>
       )
     }
     {
       formType === 'confirmSignUp' && (
         <div>
           <input name="authCode" onChange={onChange} placeholder="Confirmation code" />
           <button onClick={confirmSignUp}>Confirm Sign Up</button>
        </div>
       )
     }
     {
       formType === 'signedIn' && (
         <div>
         <h1>Hello World</h1>
         <button onClick={
           () => Auth.signOut()
         }> Sign Out </button> 
         </div>
       )
     }
    </div></Router>
  );
}

export default App;
