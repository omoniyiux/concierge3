import type { FaqContent } from "@/lib/types";
import { Empty } from "./shared";

export function Faq({ content }: { content: FaqContent }) {
  return (
    <>
      <h2 className="ps-h2">{content.heading}</h2>
      {content.items.length === 0 ? (
        <Empty>No questions added yet.</Empty>
      ) : (
        <div className="ps-faq">
          {content.items.map((item) => (
            <div key={item.id} className="ps-faq__item">
              <h3 className="ps-faq__q">{item.question}</h3>
              <p className="ps-faq__a">{item.answer}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
