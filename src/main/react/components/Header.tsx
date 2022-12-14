import React from "react"
import { AppBar, Container, Toolbar } from "@mui/material"

function Header() {
    return (
        <>
            <AppBar position="fixed" className="shadow" sx={{ zIndex: theme => theme.zIndex.drawer + 1, backgroundColor: "#2e56a3" }}>
                <Container maxWidth="xl" sx={{ px: 3, m: 0, width: "100%" }}>
                    <Toolbar disableGutters>
                        <img alt="" src="/img/interactions-logo-pure-white.png" height="50" />
                    </Toolbar>
                </Container>
            </AppBar>
        </>
    )
}

export default Header
