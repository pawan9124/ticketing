//this module is used to make sure the next js rerender the page whenever a change occur by polling every 30 milisec
module.exports = {
    webpackDevMiddleware: config => {
        config.watchOptions.poll = 300;
        return config;
    }
}