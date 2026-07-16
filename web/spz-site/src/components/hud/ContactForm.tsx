'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Send, Loader2 } from 'lucide-react';
import { GlitchText } from './GlitchText';
import { toast } from '@/hooks/use-toast';
import { trackContactOpen, trackContactSubmit } from '@/lib/analytics';

const contactSchema = z.object({
  name: z.string().min(2, { message: 'Identification required.' }),
  email: z.string().email({ message: 'Invalid signal address.' }),
  mobile: z.string().min(10, { message: 'Frequency required.' }),
  optIn: z.boolean().default(false),
});

type ContactValues = z.infer<typeof contactSchema>;

interface ContactFormProps {
  trigger?: React.ReactNode;
}

export function ContactForm({ trigger }: ContactFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', mobile: '', optIn: false },
  });

  async function onSubmit(data: ContactValues) {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          targetRecipient: 'zero@spacepiratezero.com',
        }),
      });
      if (!res.ok) throw new Error('Contact submission failed');
      trackContactSubmit(data.optIn);
      toast({
        title: 'TRANSMISSION_RECEIVED',
        description: 'Your signal has been captured. Stand by for response.',
      });
      setOpen(false);
      form.reset();
    } catch {
      toast({
        title: 'SIGNAL_INTERFERENCE',
        description: 'Transmission failed. Try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (o) trackContactOpen(); setOpen(o); }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/10">
            <Mail className="mr-2 h-4 w-4" /> CONTACT_SYSTEM
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glass-hud border-cyber-cyan/30 bg-black/90 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-cyber-cyan tracking-widest">
            <GlitchText text="ESTABLISH_CONNECTION" />
          </DialogTitle>
          <DialogDescription className="text-white/60 font-mono text-xs">
            Enter your coordinates to bypass the corporate filters.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-cyber-cyan font-headline text-[10px]">IDENTITY_NAME</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter handle..." {...field} className="bg-white/5 border-cyber-cyan/20 focus:border-cyber-cyan text-white" />
                  </FormControl>
                  <FormMessage className="text-cyber-magenta text-[10px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-cyber-cyan font-headline text-[10px]">SIGNAL_EMAIL</FormLabel>
                  <FormControl>
                    <Input placeholder="zero@example.com" {...field} className="bg-white/5 border-cyber-cyan/20 focus:border-cyber-cyan text-white" />
                  </FormControl>
                  <FormMessage className="text-cyber-magenta text-[10px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-cyber-cyan font-headline text-[10px]">MOBILE_FREQUENCY</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 555-0000" {...field} className="bg-white/5 border-cyber-cyan/20 focus:border-cyber-cyan text-white" />
                  </FormControl>
                  <FormMessage className="text-cyber-magenta text-[10px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="optIn"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 glass-hud border-white/5">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-cyber-magenta data-[state=checked]:bg-cyber-magenta"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-[10px] font-mono text-white/70">
                      I opt-in for future transmissions and digital updates.
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-cyber-cyan text-black hover:bg-cyber-cyan/80 font-headline tracking-widest py-6"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? 'UPLOADING...' : 'INITIATE_UPLINK'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
