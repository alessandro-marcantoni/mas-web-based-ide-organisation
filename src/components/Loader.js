function Loader() {
    return (
        <div id="loading">
            <img id="loading-logo"
                src={ process.env.PUBLIC_URL + "/img/interactions-logo-reduced.png" } alt="Interactions Research Group, University of St.Gallen" />
            <br />
            <p>Loading...</p>
        </div>
    );
}

export default Loader;