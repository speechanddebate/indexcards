# indexcards

The API element of the new Tabroom.com 4.0. 

The schemat-backend branch is intended to be the clean copy that does not work
around the code necessary to keep legacy Tabroom perl frontends functional.
Running this against Mason tabroom could break things.

Probs will.

===Running===

There is anonymized test data in tests/tests.sql you can load for a sample
database in mysql/maria.  Database access details go into config/config.js;
copy over the config.js.sample for a framework.

Then simply run npm run dev in the directory to run a development instance.

===Some Notes on Choices===

- The API runs on a Express backend rather than using Svelte's built in server
  for data. That eliminates Svelte's server side rendering in most cases, which
  is fine because it reduces the complexity of figuring what runs where. It
  also reduces our dependency exposure on Svelte; if that project dies or is
  eclipsed by something else, redoing the frontend only is considerably easier.

- Sequelize is used for data access, but not very extensively. I chose it
  largely for its ability to automatically supply pooled connections to a MySQL
  cluster -- and it can automatically shunt select queries to read-only
  replicas. It also handles things like data input validation and avoiding
  input trojans.

  I do not find its method of querying and pulling data for reports to be all
  that useful, and have tended to just write my own SQL using the
  sequelize.query interface and pull the data in raw format. I intend to use
  their interfaces more extensively when we get into CRUD operations more, so
  the saftey of data defintions and validations can be used better.

  - Since almost everything in Node will use sequelize anyway, I decided it was
    silly to have to import the db defintions atop every last file.

- Auth is handled inline and is context dependent on routes.  The routes are
  organized so that admin functions live under /glp (for Godlike Powers), user
  functions like account management are /user, the tab/tournament admin stuff
  is in /tab, school management will be under /coach, and anything not
  requiring a login is /public.  /ext is for externally accessible APIs that
  require a userkey and prior authorization per directory.

  The app.js function should automatically check for a live session and the
  proper permissions where required. Permissions under /tab can be quite fine
  grained so there is likely more work needed here to distinguish between
  tournament owners, tabbers, and checkers. 

    Todos and wishlist: 

    - I have been haphazard at best about naming conventions since none was
      imposed upon me. I tend to dislike Java style long ones with obvious
      elements, like getFactoryClassUserAuthFactoryFactory. But I mostly want
      some pattern that is consistent and easy and doesn't involve much
      thinking.  

      I have settled vaguely on verbOwnerThingConditions, like
      getEventEntriesWaitlist or something, but I'm not wedded to it, and I
      tend to think the get there is wasteful since 90% of the ops will be gets
      so only specifying when it isn't appeals to me.

    - Need some sort of caching control on the server side as well, for things
      like when rounds are published and the whole world slaps them at once.

    - Performance monitoring

- Svelte frontend was chosen because

    1. It has a strong tendency to remove complexity. Normal HTML markup, with
       inline commands for control, are just great. The runes are a bit of a
       mind twister but once you get how they work a lot of manual state
       management disappears. I'll never have to write a reducer.

    2. The router is the filepaths; I like this because it's a good example of
       removed complexity, since it takes two choices ('where does this live
       for me' and 'where does this live for the end user') and makes them the
       same, and I can't think of much reason why they'd ever need be
       different.

    3. It's pretty fast, even without the server side rendering.

    4. I really hate JSX. *Really.*

  Svelte was chosen *despite*

    4. The + symbols before pages. Seriously, just reserve the word or
       something. Have these people ever used a Unix shell?

    5. As much as I like the FS based router, I really dislike that EVERY page
       is named +page.svelte. There are vscode tricks to help, but having every
       file named the same thing makes me crosseyed sometimes, and it seems
       nonsense to me I can't just stick a /path/to/thing.svelte file and
       have it answer a req for /path/to/thing.

    DESIRES AND TODOS:

        - Need an error reporting page. There's a PR for that in the schemats
          github but I haven't checked it out yet

        - Definitely need to start in on an automated test framework.

        - Tailwind is great but some more elements (sidelinks, etc) need to be
          defined in app.css so that we don't end up writing the same six line
          Tailwind stanzas.

        - It seems silly to me that we have to write the same code over and
          over for wait states from Tanstack Query (...if isFetching....). I
          pushed much of that into a $lib/layouts/Loading.svelte component but
          not all of it and even that's not as automatic as I'd like.

        - When we get to POSTing data, need a generic solution for CSRF
          validation.

- Tanstack Query was chosen because

    1. It kills a lot of the manual state management and cache management left
       over that Svelte itself does not. You can run the same query on sixteen
       pages and it'll automatically pull the non expired data from the browser
       cache if it's already there without you having to pass props around in
       complex ways.

    2. It abstracts away data access to the point that it can just live in the
       main file as a two liner. I know that my habit of putting data access
       and data display in the same file horrifies most people in legacy code,
       but in this case it's seriously just two lines that spec a Node API URL
       and a key, which I always simply make the URL anyway because it
       eliminates another convention or decision.  I have written a wrapper
       called indexFetch that works around some nice defaults.

    3. It provides some nice query management tools for development that are
       automatically enabled at the bottom of the screen.

       - Need a generic reload method and to spec out just how long some data
         intervals should be, especially on heavy but frequently urgent pages
         like schematics on the public end or dashboards. Can caches be blanket
         invalidated on the server end when, say, a round is posted? Seems like
         it should!
         

