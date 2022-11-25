import React from "react";
import {AppBar, Container, Toolbar} from "@mui/material";

function Header() {
    return (
        <>
            <AppBar position="fixed" className="shadow"
                    sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Container maxWidth="xl" sx={{px: 3, m: 0}}>
                    <Toolbar disableGutters>
                        <img
                            alt=""
                            src="/img/interactions-logo-pure-white.png"
                            height="50"
                            className="d-inline-block align-top"
                        />
                    </Toolbar>
                </Container>
            </AppBar>
        </>
    );
}

export default Header;
