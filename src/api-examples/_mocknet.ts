// A Net for API examples that answers from mock handlers: no transport leaves the page.
import { Net } from "hadi-march/net";
import { MockTransport, type MockHandlers } from "hadi-march/net/mock";

export const mockNet = (h: MockHandlers, delay: number | [number, number] = [60, 180]): Net => new Net().transport(new MockTransport(h, { delay }), "http");
