import React, { Component } from "react";
import "./App.css";

import Navigation from "./components/Navigation/Navigation";
import Logo from "./components/Logo/Logo";
import Rank from "./components/Rank/Rank";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import FaceDetector from "./components/FaceDetector/FaceDetector";
import Signin from "./components/Signin/Signin";
import Register from "./components/Register/Register";

const initialState = {
    input: "",
    imageUrl: "",
    faceboxes: null,
    route: "signin",
    isSignedIn: false,
    user: {
        id: "",
        name: "",
        email: "",
        entries: "",
        joined: ""
    }
};

class App extends Component {
    constructor(props) {
        super(props);

        this.state = initialState;
    }

    componentDidMount() {
        fetch("http://localhost:3000")
            .then(response => response.json())
            .then(data => console.log(data));
    }

    handleFacesLocationData = respData => {
        this.setState({
            faceboxes: respData.outputs[0].data.regions
        });
    };

    handleInputChange = e => {
        this.setState({ input: e.target.value });
    };

    handleInputSubmit = e => {
        this.setState({
            imageUrl: this.state.input,
            faceboxes: null
        });

        fetch("http://localhost:3000/image_url", {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                input: this.state.input
            })
        })
            .then(response => response.json())
            .then(response => {
                if (response) {
                    fetch("http://localhost:3000/image", {
                        method: "put",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            id: this.state.user.id
                        })
                    })
                        .then(response => response.json())
                        .then(count => {
                            this.setState({
                                user: {
                                    ...this.state.user,
                                    entries: count
                                }
                            });
                        })
                        .catch(console.log);
                }
                this.handleFacesLocationData(response);
            })
            .catch(err => console.log(err));
    };

    handleRouteChange = route => () => {
        if (route === "signout") {
            this.setState(initialState);
        } else if (route === "home") {
            this.setState({ isSignedIn: true });
        }

        this.setState({ route: route });
    };

    handleLoadUser = userData => {
        this.setState({
            user: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                entries: userData.entries,
                joined: userData.joined
            }
        });
    };

    render() {
        let content = (
            <Signin
                handleRouteChange={this.handleRouteChange}
                loadUser={this.handleLoadUser}
            />
        );

        if (this.state.route === "home") {
            content = (
                <div>
                    <Logo />
                    <Rank
                        name={this.state.user.name}
                        entries={this.state.user.entries}
                    />
                    <ImageLinkForm
                        onInputChange={this.handleInputChange}
                        onInputSubmit={this.handleInputSubmit}
                    />
                    <FaceDetector
                        imageUrl={this.state.imageUrl}
                        faceboxes={this.state.faceboxes}
                    />
                </div>
            );
        } else if (this.state.route === "register") {
            content = (
                <Register
                    handleRouteChange={this.handleRouteChange}
                    loadUser={this.handleLoadUser}
                />
            );
        }

        return (
            <div className="App">
                <Navigation
                    handleRouteChange={this.handleRouteChange}
                    isSignedIn={this.state.isSignedIn}
                />
                {content}
            </div>
        );
    }
}

export default App;
