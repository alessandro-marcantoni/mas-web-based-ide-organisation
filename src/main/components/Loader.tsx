import { Box, Button, Toolbar } from "@mui/material"
import axios from "axios"
import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import config from "../utils/config"

function Loader() {
    const navigate = useNavigate()

    useEffect(() => {
        axios.get(config.BACKEND_URL + "/specifications").then(r => console.log(r.data))
    })

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
                <Button variant="contained" onClick={() => navigate("/structural")} sx={{mt: 2, width: 200}}>
                    New organization
                </Button>
                <Button variant="contained" onClick={() => navigate("/structural")} sx={{mt: 2, width: 200}}>
                    Load organization
                </Button>
            </Box>
        </>
    )
}

export default Loader
