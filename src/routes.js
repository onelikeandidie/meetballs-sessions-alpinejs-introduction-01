import Router from '@koa/router';
import fs from "fs/promises";
import path from "path";

export default (app) => {
    const router = new Router();

    router.get('/', async (ctx, _next) => {
        // The home has code from its own file on the frontend
        // So we need to read it read those sections so that they can be
        // included in the final html
        // Each section is outlined by {# code1 #} and {# code1end #} where 1 is the section number
        let home = await fs.readFile(path.join(import.meta.dirname, '../frontend/views/home.html'), 'utf8');
        let codeSections = home.match(/{# code\d #}[\s\S]*?{# code\dend #}/g);
        let code = {};
        if (codeSections !== null) {
            for (let section of codeSections) {
                let sectionNumber = section.match(/{# code(\d) #}/)[1];
                // Remove the section markers
                section = section.replace(/{# code\d #}/, '');
                section = section.replace(/{# code\dend #}/, '');
                // Remove {# hidden #} and {# hiddenend #} sections
                let hiddenSections = section.match(/{# hidden #}[\s\S]*?{# hiddenend #}/g);
                if (hiddenSections !== null) {
                    for (let hidden of hiddenSections) {
                        // If within the hidden section there is a {# replace #} and {# replaceend #}
                        // Then replace the section with the content between those markers
                        let replaceSection = hidden.match(/{# replace #}[\s\S]*?{# replaceend #}/);
                        if (replaceSection !== null) {
                            replaceSection = replaceSection[0];
                            replaceSection = replaceSection.replace(/{# replace #}/, '');
                            replaceSection = replaceSection.replace(/{# replaceend #}/, '');
                            section = section.replace(hidden, replaceSection);
                        } else {
                            section = section.replace(hidden, '{# ... #}');
                        }
                    }
                }
                code[parseInt(sectionNumber)] = section.trim();
            }
        }
        console.log(code);

        await ctx.render('home', {
            code
        });
    })

    router.get('/albums', async (ctx, _next) => {
        ctx.type = "application/json";
        ctx.body = JSON.stringify([
            {
                id: 1,
                title: "Album 1",
                artist: "Artist 1",
                year: 2021
            },
            {
                id: 2,
                title: "Album 2",
                artist: "Artist 2",
                year: 2020
            },
            {
                id: 3,
                title: "Album 3",
                artist: "Artist 3",
                year: 2019
            },
            {
                id: 4,
                title: "Album 4",
                artist: "Artist 4",
                year: 2021
            },
            {
                id: 5,
                title: "Album 5",
                artist: "Artist 5",
                year: 2020
            },
            {
                id: 6,
                title: "Album 6",
                artist: "Artist 6",
                year: 2019
            },
        ]);
    });

    // TOOTER
    router.get('/tooter', async (ctx, _next) => {
        if (ctx.session.user === undefined) {
            ctx.redirect('/tooter/login');
            return;
        }
        await ctx.render('tooter/home', {
            toots: ctx.database.getToots()
        });
    });
    router.get('/tooter/toots', async (ctx, _next) => {
        if (ctx.request.accepts('json')) {
            ctx.type = "application/json";
            ctx.body = JSON.stringify(ctx.database.getToots());
            return;
        }
        ctx.redirect('/tooter');
    });
    router.get('/tooter/login', async (ctx, _next) => {
        if (ctx.session.user !== undefined) {
            ctx.redirect('/tooter');
            return;
        }
        await ctx.render('tooter/login');
    });
    router.post('/tooter/login', async (ctx, _next) => {
        ctx.session.user = ctx.request.body.username.toLowerCase().replace(/[^a-z0-9\-]/g, '');
        ctx.redirect('/tooter');
    });
    router.get('/tooter/logout', async (ctx, _next) => {
        ctx.session.user = undefined;
        ctx.redirect('/tooter/login');
    });
    router.post('/tooter/toot', async (ctx, _next) => {
        let toot = {
            content: ctx.request.body.content,
            author: ctx.session.user,
            date: (new Date()).getTime(),
        };
        const newToot = ctx.database.createToot(toot);
        console.log("Created new toot", newToot);
        ctx.session.success = 'Created new Toot';
        if (ctx.request.accepts('json')) {
            ctx.type = "application/json";
            ctx.body = JSON.stringify(newToot);
        } else {
            ctx.redirect('/tooter');
        }
        ctx.database.save();
    });
    // This is for vanilla html
    router.post('/tooter/toot/:id/delete', handleDelete);
    // This is for alpine
    router.delete('/tooter/toot/:id', handleDelete);
    async function handleDelete(ctx, _next) {
        const id = ctx.params.id;
        let toot = ctx.database.getToot(id);
        if (toot === undefined) {
            let error = "Cannot find toot";
            if (ctx.request.accepts('json')) {
                ctx.type = "application/json";
                ctx.body = JSON.stringify({error});
            } else {
                ctx.session.error = error;
                ctx.redirect("/tooter");
            }
            return;
        }
        if (toot.author !== ctx.session.user) {
            let error = "You can only delete your own toots";
            if (ctx.request.accepts('json')) {
                ctx.body = JSON.stringify({error});
            } else {
                ctx.session.error = error;
                ctx.redirect("/tooter");
            }
            return;
        }
        const deletedToot = ctx.database.deleteToot(id);
        console.log("Deleted toot", deletedToot);
        if (ctx.request.accepts('json')) {
            ctx.type = "application/json";
            ctx.body = JSON.stringify({
                success: 'Deleted Toot',
                deletedToot
            });
        } else {
            ctx.session.success = 'Deleted Toot';
            ctx.redirect('/tooter');
        }
        ctx.database.save();
    }
    router.get('/tooter/:user', async (ctx, _next) => {
        if (ctx.session.user === undefined) {
            ctx.redirect('/tooter/login');
            return;
        }
        await ctx.render('tooter/profile', {
            toots: ctx.database.getUserToots(ctx.params.user)
        });
    });

    app.use(router.routes())
        .use(router.allowedMethods());
};
