import { eventBus } from "@/lib/event";
import { helper } from "@/lib/helper";
import {
  addActivePlugin$,
  realmPlugin,
  activeEditor$,
} from "@mdxeditor/editor";
import { TextNode } from "lexical";
import { showTagSelectPop } from "../../TagSelectPop";
export const hashTagPlugin = realmPlugin({
  init(realm): void {
    realm.pubIn({
      [addActivePlugin$]: "hashTag-highlight",
    });
  },
  postInit(realm, params) {
    const currentEditor = realm.getValue(activeEditor$);
    if (!currentEditor) {
      return;
    }
    currentEditor.registerNodeTransform(TextNode, (textNode) => {
      const currentText = textNode.getTextContent();
      // console.log(currentText)
      const endsWithAnyTextNoHashRegex = /\S(?<!#)$/g
      const hasHashTagRegex = /#[^\s#]+/g
      const endsWithBankRegex = /\s$/g

      const isEndsWithBank = endsWithBankRegex.test(currentText)
      const isEndsWithHashTag = helper.regex.isEndsWithHashTag.test(currentText)
      // console.log({
      //   isEndsWithHashTag,
      //   isEndsWithBank
      // })
      if (currentText == '' || !isEndsWithHashTag) {
        setTimeout(() => eventBus.emit('hashpop:hidden'))
        return
      }
      if (isEndsWithHashTag && currentText != '' && !isEndsWithBank) {
        const match = currentText.match(hasHashTagRegex)
        let searchText = match?.[match?.length - 1] ?? ''
        if (currentText.endsWith("#")) {
          searchText = ''
        }
        console.log("searchText  ->", searchText.toLowerCase())
        showTagSelectPop(searchText.toLowerCase())
      }

    });
  },
});
