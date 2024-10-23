import { observer } from "mobx-react-lite"
import Editor from "../Common/Editor"
import { RootStore } from "@/store"
import { BlinkoStore } from "@/store/blinkoStore"
import { DialogStore } from "@/store/module/Dialog"
import dayjs from "@/lib/dayjs"
import { useEffect, useRef } from "react"
import usePasteFile from "@/lib/hooks"

type IProps = {
  mode: 'create' | 'edit',
  onSended?: () => void,
  onHeightChange?: (height: number) => void
}
export const BlinkoEditor = observer(({ mode, onSended, onHeightChange }: IProps) => {
  const isCreateMode = mode == 'create'
  const blinko = RootStore.Get(BlinkoStore)
  const editorRef = useRef<any>(null)
  // const pastedFiles = usePasteFile(editorRef);
  // useEffect(() => {
  //   console.log(pastedFiles)
  // }, [blinko.noteContent, pastedFiles])

  return <div ref={editorRef} id='global-editor'>
    <Editor
      originFiles={!isCreateMode ? blinko.curSelectedNote?.attachments : []}
      content={isCreateMode ? blinko.noteContent : blinko.curSelectedNote?.content}
      onChange={v => {
        onHeightChange?.(editorRef.current.clientHeight)
        isCreateMode ? (blinko.noteContent = v) : (blinko.curSelectedNote.content = v)
      }}
      isSendLoading={blinko.upsertNote.loading.value}
      bottomSlot={
        isCreateMode ? <div className='text-xs text-ignore ml-2'>Drop to upload files</div> :
          <div className='text-xs text-desc'>{dayjs(blinko.curSelectedNote.createdAt).format("YYYY-MM-DD hh:mm:ss")}</div>
      }
      onSend={async ({ files }) => {
        if (isCreateMode) {
          await blinko.upsertNote.call({ content: blinko.noteContent, attachments: files.map(i => { return { name: i.name, path: i.uploadPath, size: i.size } }) })
        } else {
          await blinko.upsertNote.call({
            id: blinko.curSelectedNote.id,
            content: blinko.curSelectedNote.content, attachments: files.map(i => { return { name: i.name, path: i.uploadPath, size: i.size } })
          })
        }
        onSended?.()
      }} />
  </div>
})


