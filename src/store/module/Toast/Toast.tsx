import { Store } from "@/store/standard/base";
import React from "react";
import toast, { Toaster } from "react-hot-toast";

export class ToastPlugin implements Store {
  sid = "ToastPlugin";
  provider = () => (
    <Toaster
      toastOptions={{
        className: '!bg-[#fff] !rounded-2xl !text-[#000] dark:!bg-[#131218] dark:!text-[#fff] !shadow-md',
      }}
    />
  );

  splitTextIntoLines(text: string, lineLength: number): string {
    const regex = new RegExp(`.{1,${lineLength}}`, 'g');
    return text.match(regex)?.join('\n') || '';
  }

  success(str: string) {
    toast.success(str, { icon: '👏' })
  };
  error(str: string) {
    toast.error(this.splitTextIntoLines(str, 60))
  };
  loading = toast.loading;
  custom = toast.custom;
  dismiss = toast.dismiss;
  remove = toast.remove;
  promise = toast.promise;
}
