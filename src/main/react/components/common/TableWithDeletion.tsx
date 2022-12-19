import { Delete } from "@mui/icons-material"
import { Grid, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"
import React from "react"
import { Component } from "../../../typescript/commons"

type TableProps<T> = {
    cols: Array<string>
    items: Array<T>
    props: Array<(e: T) => string>
    onDelete: (c : Component) => void
}

const TableWithDeletion = <T,>(p: TableProps<T>) => (
    <Grid item xs={12} sx={{ width: 500 }}>
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        {p.cols.map(c => (
                            <TableCell key={c}>{c}</TableCell>
                        ))}
                        <TableCell width={50} />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {p.items.map(i => (
                        <TableRow key={p.props.map(f => f(i)).join()}>
                            {p.props
                                .map(f => f(i))
                                .map(e => (
                                    <TableCell key={e}>{e}</TableCell>
                                ))}
                            <TableCell sx={{ p: 0 }}>
                                <IconButton onClick={() => p.onDelete(i as Component)}>
                                    <Delete />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </Grid>
)

export default TableWithDeletion