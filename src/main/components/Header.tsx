import React from "react";
import {Container, Navbar} from "react-bootstrap";

function Header() {
    return (
        <Navbar bg="blue" variant="dark" className="shadow">
            <Container fluid="true">
                <Navbar.Brand className="p-4">
                    <img
                        alt=""
                        src="/img/interactions-logo-pure-white.png"
                        height="80"
                        className="d-inline-block align-top"
                    />
                </Navbar.Brand>
            </Container>
        </Navbar>
    );
}

export default Header;
