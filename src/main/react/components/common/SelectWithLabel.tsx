import { Grid, InputLabel, MenuItem, Select } from "@mui/material"
import React from "react"
import { noRole } from "./SideMenu"
import { shortName } from "../../../typescript/structural/utils"

type SelectWithLabelProps = {
    width: number
    label: string
    value: string
    valueChange: (v: string) => void
    options: Array<string>
}

const SelectWithLabel = (p: SelectWithLabelProps) => (
    <Grid item xs={p.width}>
        <InputLabel id="compatibilityLabel" htmlFor="compatibility">
            {p.label}
        </InputLabel>
        <Select
            id="compatibility"
            labelId="compatibilityLabel"
            fullWidth
            variant="standard"
            value={p.value}
            renderValue={v => (v === noRole ? "" : shortName(v))}
            onChange={e => p.valueChange(e.target.value)}
            sx={{ maxWidth: 400 }}>
            <MenuItem value={noRole} />
            {p.options.map((r: string) => (
                <MenuItem key={r} value={r}>
                    {shortName(r)}
                </MenuItem>
            ))}
        </Select>
    </Grid>
)

export default SelectWithLabel