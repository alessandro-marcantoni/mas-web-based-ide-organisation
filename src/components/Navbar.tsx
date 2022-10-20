import '../style/main.scss';
import React from "react";

function Navbar() {
    return (
        <div id="header">
            <div className="logo-left"><img src="/img/interactions-logo-pure-white.png" alt="Interactions Research Group, University of St.Gallen" /></div>

            <div id="settings">
                <div><label htmlFor="workspace-chooser">Select workspace</label></div>
                <div id="workspace">
                    <div>
                        <select id="workspace-chooser">
                            <option value="none">No workspaces</option>
                        </select>
                    </div>
                    <a id="explore-button" target="_blank" className="btn" href="/">Explore</a>
                </div>
            </div>

        </div>
    );
}

export default Navbar;
