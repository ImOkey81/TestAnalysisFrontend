import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function SectionTabs({
  defaultValue,
  tabs,
}: {
  defaultValue: string
  tabs: Array<{ value: string; label: string; content: React.ReactNode }>
}) {
  return (
    <Tabs defaultValue={defaultValue}>
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
