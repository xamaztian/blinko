import React, { use, useEffect, useRef, useState, useTransition } from "react";
import { Avatar, Button, ScrollShadow, Spacer, Image, useDisclosure, Input, Tabs, Tab, Card } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { UserStore } from "@/store/user";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import { observer } from "mobx-react-lite";
import { RootStore } from "@/store";
import { BlinkoStore } from "@/store/blinkoStore";
import SidebarDrawer from "./sidebar-drawer";
import ThemeSwitcher from "../Common/ThemeSwitcher";
import { TagListPanel } from "../Common/TagListPanel";
import { useTheme } from "next-themes";
import { _ } from "@/lib/lodash";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../Common/LanguageSwitcher";
import { BaseStore } from "@/store/baseStore";
import { BlinkoAi } from "../BlinkoAi";

export const SideBarItem = "p-2 flex flex-row items-center cursor-pointer gap-2 hover:bg-hover hover:bg-hover-foreground rounded-xl transition-all"

export const CommonLayout = observer(({
  children,
  header,
}: {
  children?: React.ReactNode;
  header?: React.ReactNode;
}) => {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [isOpen, setisOpen] = useState(false)
  const { t, i18n } = useTranslation()
  const { theme } = useTheme();
  const user = RootStore.Get(UserStore)
  const blinkoStore = RootStore.Get(BlinkoStore)
  const base = RootStore.Get(BaseStore)
  let debounceSearch: any = null
  blinkoStore.use()
  user.use()

  useEffect(() => {
    base.changeLanugage(i18n, base.locale.value)
    setIsClient(true)
    debounceSearch = _.debounce(() => {
      blinkoStore.noteList.resetAndCall({})
    })
  }, [router.isReady])

  if (!isClient) return <></>

  if (router.pathname == '/signin' || router.pathname == '/signup' || router.pathname == '/api-doc') {
    return <>{children}</>
  }

  const content = (
    <div className=" flex h-full w-64 flex-1 flex-col p-4 ">
      <div className="flex items-center gap-2 px-2">
      </div>
      <div className="flex items-start gap-2 px-2 select-none">
        {
          theme == 'dark' ? <Image src="/logo-dark.svg" width={100} /> : <Image src="/logo.svg" width={100} />
        }
      </div>
      <ScrollShadow className="-mr-6 mt-[-5px] h-full max-h-full pr-6">
        <div>
          <div className="flex flex-col gap-1 mt-4 font-semibold">
            {
              blinkoStore.routerList.map(i => {
                return <Link key={i.title} href={i.href} onClick={() => {
                  blinkoStore.currentRouter = i
                  setisOpen(false)
                }}>
                  <div className={`${SideBarItem} ${i?.href == router.pathname ? '!bg-primary !text-primary-foreground' : ''}`}>
                    <Icon icon={i.icon} width="20" height="20" />
                    <div className="">{t(i.title)}</div>
                  </div>
                </Link>
              })
            }

            <div>
              {blinkoStore.tagList.value?.listTags.length != 0 && blinkoStore.tagList.value?.listTags && <>
                <div className="ml-2 my-2 text-xs font-bold text-[#a252e1]">{t('total-tags')}</div>
                <TagListPanel />
              </>}
            </div>
          </div>
        </div>
      </ScrollShadow>
    </div>
  );

  return (
    <div className="flex h-dvh w-full">
      {
        blinkoStore.showAi && <BlinkoAi />
      }
      <SidebarDrawer className="flex-none" isOpen={isOpen} onOpenChange={e => setisOpen(false)}>
        {content}
      </SidebarDrawer>
      <div className="flex w-full flex-col gap-y-1 sm:max-w-[calc(100%_-_258px)] bg-sencondbackground">
        {/* nav bar  */}
        <header className="flex h-16 min-h-16 items-center justify-between gap-2 rounded-medium px-4 pt-2 pb-2">
          <div className="flex max-w-full items-center gap-2 md:p-2">
            <Button
              isIconOnly
              className="flex sm:hidden"
              size="sm"
              variant="light"
              onPress={e => setisOpen(true)}
            >
              <Icon
                className="text-default-500"
                height={24}
                icon="solar:hamburger-menu-outline"
                width={24}
              />
            </Button>
            <h2 className="truncate text-xl font-normal md:font-bold text-default-700 flex gap-2 items-center justify-center">
              <div className="w-[3px] h-[16px] bg-primary"></div>
              {/* @ts-ignore */}
              <div className="font-black select-none">{t(blinkoStore.currentRouter?.title)}</div>
              <Icon icon="fluent:arrow-sync-12-filled" width="20" height="20" />
              <Input
                fullWidth
                aria-label="search"
                classNames={{
                  base: "px-1 mr-4 w-[full] md:w-[300px]",
                  inputWrapper:
                    "bg-default-400/20 data-[hover=true]:bg-default-500/30 group-data-[focus=true]:bg-default-500/20",
                  input: "placeholder:text-default-600 group-data-[has-value=true]:text-foreground",
                }}
                labelPlacement="outside"
                placeholder={t('search')}
                value={blinkoStore.noteListFilterConfig.searchText}
                onChange={e => {
                  blinkoStore.noteListFilterConfig.searchText = e.target.value
                  debounceSearch?.()
                }}
                startContent={
                  <Icon
                    className="text-default-600 [&>g]:stroke-[2px]"
                    icon="solar:magnifer-linear"
                    width={18}
                  />
                }
              />
            </h2>
          </div>
          {header}
        </header>


        {/* main container  */}
        <main className="flex h-[calc(100%_-_100px)] overflow-y-scroll scroll-container">
          <div className="flex h-full w-full flex-col rounded-medium" >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
})
