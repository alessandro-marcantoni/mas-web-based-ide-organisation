import { Box, Button, Toolbar } from "@mui/material"
import React from "react"
import { useNavigate } from "react-router-dom"

function Loader() {
    const navigate = useNavigate()
    return (
        <>
            <Toolbar />
            <Box
                sx={{
                    p: 5,
                    mt: 20,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}>
                <img
                    id="loading-logo"
                    width={300}
                    src="/img/interactions-logo-reduced.png"
                    alt="Interactions Research Group, University of St.Gallen"
                />
                <Button variant="contained" onClick={() => navigate("/structural")}>
                    Create organization
                </Button>
            </Box>
        </>
    )
}

export default Loader
