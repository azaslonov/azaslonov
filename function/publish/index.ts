import { InversifyInjector } from "@paperbits/common/injection";
import { IPublisher } from "@paperbits/common/publishing";
import { FormsModule } from "@paperbits/forms/forms.module";
import { CoreModule } from "@paperbits/core/core.module";
import { CorePublishModule } from "@paperbits/core/core.publish.module";
import { EmailsModule } from "@paperbits/emails/emails.module";
import { EmailsPublishModule } from "@paperbits/emails/emails.publish.module";
import { StyleModule } from "@paperbits/styles/styles.module";
import { ProseMirrorModule } from "@paperbits/prosemirror/prosemirror.module";
import { IntercomPublishModule } from "@paperbits/intercom/intercom.publish.module";
import { GoogleTagManagerPublishModule } from "@paperbits/gtm/gtm.publish.module";
import { DemoPublishModule } from "../../src/components/demo.publish.module";
import { LogService } from "./appInsightsLogger"

export async function publish(): Promise<void> {
    /* Uncomment to enable Firebase module */
    // import { FirebaseModule } from "@paperbits/firebase/firebase.admin.module";

    /* Initializing dependency injection container */
    const injector = new InversifyInjector();
    injector.bindModule(new CoreModule());
    injector.bindModule(new CorePublishModule());
    injector.bindModule(new FormsModule());
    injector.bindModule(new EmailsModule());
    injector.bindModule(new EmailsPublishModule());
    injector.bindModule(new StyleModule());
    injector.bindModule(new ProseMirrorModule());
    injector.bindModule(new IntercomPublishModule());
    injector.bindModule(new GoogleTagManagerPublishModule());
    injector.bindInstance("logger", new LogService("a200340d-6b82-494d-9dbf-687ba6e33f9e"));

    /* Initializing Demo module */
    const outputBasePath = "./dist/website";
    const settingsPath = "./dist/publisher/config.json";
    const dataPath = "./dist/publisher/data/demo.json";
    injector.bindModule(new DemoPublishModule(dataPath, settingsPath, outputBasePath));

    /* Uncomment to enable Firebase module */
    // injector.bindModule(new FirebaseModule());

    injector.resolve("autostart");

    /* Building dependency injection container */
    const publisher = injector.resolve<IPublisher>("sitePublisher");

    /* Running actual publishing */
    publisher.publish()
        .then(() => {
            console.log("DONE.");
            process.exit();
        })
        .catch((error) => {
            console.log(error);
            process.exit();
        });
}


export async function run(context, req): Promise<void> {
    try {
        context.log("Publishing website...");
        await publish();
        context.log("Done.");

        context.res = {
            status: 200,
            body: "Done."
        };
    }
    catch (error) {
        context.log.error(error);

        context.res = {
            status: 500,
            body: JSON.stringify(error)
        };
    }
    finally {
        context.done();
    }
}