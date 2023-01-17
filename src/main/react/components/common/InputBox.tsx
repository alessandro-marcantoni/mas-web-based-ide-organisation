import { Add } from "@mui/icons-material"
import { Autocomplete, Button, Grid, TextField } from "@mui/material"
import React from "react"

type InputBoxProps = {
    space: Array<number>
    options: Array<Array<string>>
    onChange: Array<(value: string) => void>
    label: Array<string>
    value: Array<string>
    onButtonClick: () => void
}

const InputBox = (p: InputBoxProps) => (
    <Grid container spacing={1}>
        {range(0, p.space.length - 1).map(i => (
            <Grid item xs={p.space[i]} key={i}>
                <Autocomplete
                    size="small"
                    freeSolo
                    options={p.options[i]}
                    onInputChange={(e, value) => p.onChange[i](value)}
                    onChange={(e, value) => p.onChange[i](value instanceof Array<string> ? value.join() : value)}
                    renderInput={params => <TextField {...params} label={p.label[i]} variant="standard" size="small" />}
                />
            </Grid>
        ))}
        <Grid item xs={12 - p.space.reduce((a, b) => a + b, 0)}>
            <Button
                variant="contained"
                sx={{ height: "100%" }}
                fullWidth={true}
                disabled={p.value.every(v => v === "" || !v)}
                onClick={p.onButtonClick}>
                <Add />
            </Button>
        </Grid>
    </Grid>
)

export default InputBox

const range: (start: number, end: number) => Array<number> = (start, end) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i * 1)