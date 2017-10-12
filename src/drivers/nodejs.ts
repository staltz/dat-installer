import xs, { Stream, Listener, Producer } from "xstream";
import * as nodejs from "nodejs-mobile-react-native";

export default function makeNodejsDriver() {
  nodejs.start();
  return function nodejsDriver(sink: Stream<string>): Stream<string> {
    sink.addListener({
      next: req => {
        nodejs.channel.send(req);
      }
    });

    const source = xs.create<string>({
      listener: null,
      start(listener: Listener<string>) {
        this.listener = listener;
        nodejs.channel.addListener("message", listener.next.bind(listener));
      },
      stop() {
        if (this.listener) {
          nodejs.channel.removeListener("message", this.listener);
        }
      }
    } as Producer<string>);

    return source;
  };
}
