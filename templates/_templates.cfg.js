/**
 * Template MAIN for tests
 */
(function () {
    if (!window.LAZZY || !window.LAZZY.isReady) {
        console.error('Cannot load Template. LAZZY is not ready!');
        return false;
    }

    var templates = {
        "templates/main_test.tpl.html": {"defaults": {'TITLE': 'Title'}},
        "templates/x_test.tpl.html": {"defaults": {'BLAH': 'Blah!!'}}
    };

    // list the templates here
    window.LAZZY.loadTemplates(templates);
})();

