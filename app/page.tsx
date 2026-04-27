"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Languages, FileText, Braces } from "lucide-react"
import { toast } from "@/hooks/use-toast"

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "tr", name: "Turkish" },
  { code: "pl", name: "Polish" },
  { code: "nl", name: "Dutch" },
  { code: "sv", name: "Swedish" },
  { code: "da", name: "Danish" },
  { code: "no", name: "Norwegian" },
  { code: "fi", name: "Finnish" },
  { code: "cs", name: "Czech" },
]

export default function HomePage() {
  const [textInput, setTextInput] = useState("")
  const [objectInput, setObjectInput] = useState("")
  const [sourceLanguage, setSourceLanguage] = useState("en")
  const [targetLanguages, setTargetLanguages] = useState<string[]>(["es"])
  const [textResult, setTextResult] = useState<Record<string, string>>({})
  const [objectResult, setObjectResult] = useState<Record<string, object>>({})
  const [isTranslatingText, setIsTranslatingText] = useState(false)
  const [isTranslatingObject, setIsTranslatingObject] = useState(false)

  const toggleTarget = (code: string) => {
    setTargetLanguages((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  const handleTextTranslation = async () => {
    if (!textInput.trim()) {
      toast({ title: "Error", description: "Please enter text to translate", variant: "destructive" })
      return
    }
    if (targetLanguages.length === 0) {
      toast({ title: "Error", description: "Please select at least one target language", variant: "destructive" })
      return
    }

    setIsTranslatingText(true)
    try {
      const results: Record<string, string> = {}
      await Promise.all(
        targetLanguages.map(async (target) => {
          const response = await fetch("/api/translate/text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: textInput, source: sourceLanguage, target }),
          })
          if (!response.ok) throw new Error("Translation failed")
          const data = await response.json()
          results[target] = data.translatedText
        })
      )
      setTextResult(results)
      toast({ title: "Success", description: "Text translated successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to translate text. Please try again. " + error, variant: "destructive" })
    } finally {
      setIsTranslatingText(false)
    }
  }

  const handleObjectTranslation = async () => {
    if (!objectInput.trim()) {
      toast({ title: "Error", description: "Please enter a JSON object to translate", variant: "destructive" })
      return
    }
    if (targetLanguages.length === 0) {
      toast({ title: "Error", description: "Please select at least one target language", variant: "destructive" })
      return
    }

    let parsedObject
    try {
      parsedObject = JSON.parse(objectInput)
    } catch {
      toast({ title: "Error", description: "Invalid JSON format. Please check your input.", variant: "destructive" })
      return
    }

    setIsTranslatingObject(true)
    try {
      const response = await fetch("/api/translate/object", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          object: parsedObject,
          source: sourceLanguage,
          targets: targetLanguages,
        }),
      })

      if (!response.ok) throw new Error("Translation failed")

      const data = await response.json()
      // API returns { translatedObjects: { es: {...}, fr: {...} } } for multiple targets
      // or { translatedObject: {...} } for single target
      if (data.translatedObjects) {
        setObjectResult(data.translatedObjects)
      } else {
        setObjectResult({ [targetLanguages[0]]: data.translatedObject })
      }
      toast({ title: "Success", description: "Object translated successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to translate object. Please try again." + error, variant: "destructive" })
    } finally {
      setIsTranslatingObject(false)
    }
  }

  const getLangName = (code: string) => languages.find((l) => l.code === code)?.name ?? code

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Languages className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">AI Translator</h1>
          </div>
          <p className="text-lg text-gray-600">Powered by Claude AI - Translate text and JSON objects instantly</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Language Settings
            </CardTitle>
            <CardDescription>Select source language and one or more target languages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="source-language">Source Language</Label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger id="source-language" className="w-48">
                  <SelectValue placeholder="Select source language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                Target Languages{" "}
                <span className="text-gray-400 font-normal">({targetLanguages.length} selected)</span>
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {languages.map((lang) => (
                  <label
                    key={lang.code}
                    className="flex items-center gap-2 cursor-pointer rounded-md border px-3 py-2 text-sm hover:bg-gray-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-300"
                  >
                    <Checkbox
                      checked={targetLanguages.includes(lang.code)}
                      onCheckedChange={() => toggleTarget(lang.code)}
                    />
                    {lang.name}
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Text Translation
            </TabsTrigger>
            <TabsTrigger value="object" className="flex items-center gap-2">
              <Braces className="h-4 w-4" />
              Object Translation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Text Translation</CardTitle>
                <CardDescription>Enter any text to translate it to your selected target languages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="text-input">Text to translate</Label>
                  <Textarea
                    id="text-input"
                    placeholder="Enter text to translate..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
                <Button onClick={handleTextTranslation} disabled={isTranslatingText} className="w-full">
                  {isTranslatingText ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    "Translate Text"
                  )}
                </Button>
                {Object.keys(textResult).length > 0 && (
                  <div className="space-y-3">
                    <Label>Translation Results</Label>
                    {targetLanguages.filter((t) => textResult[t]).map((code) => (
                      <div key={code} className="p-4 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-xs font-semibold text-green-600 mb-1">{getLangName(code)}</p>
                        <p className="text-green-800">{textResult[code]}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="object" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Object Translation</CardTitle>
                <CardDescription>
                  Enter a JSON object to translate all string values to your selected target languages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="object-input">JSON Object to translate</Label>
                  <Textarea
                    id="object-input"
                    placeholder='{"title": "Hello World", "description": "This is a sample object"}'
                    value={objectInput}
                    onChange={(e) => setObjectInput(e.target.value)}
                    rows={6}
                    className="resize-none font-mono text-sm"
                  />
                </div>
                <Button onClick={handleObjectTranslation} disabled={isTranslatingObject} className="w-full">
                  {isTranslatingObject ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    "Translate Object"
                  )}
                </Button>
                {Object.keys(objectResult).length > 0 && (
                  <div className="space-y-3">
                    <Label>Translation Results</Label>
                    {targetLanguages.filter((t) => objectResult[t]).map((code) => (
                      <div key={code} className="p-4 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-xs font-semibold text-green-600 mb-1">{getLangName(code)}</p>
                        <pre className="text-green-800 text-sm overflow-x-auto">
                          {JSON.stringify(objectResult[code], null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
            <CardDescription>Use these endpoints to integrate translation into your applications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Text Translation</h3>
                <code className="text-sm text-gray-600">POST /api/translate/text</code>
                <pre className="text-xs mt-2 text-gray-500">
                  {`{
  "text": "Hello World",
  "source": "en",
  "target": "es"
}`}
                </pre>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Object Translation (multi-target)</h3>
                <code className="text-sm text-gray-600">POST /api/translate/object</code>
                <pre className="text-xs mt-2 text-gray-500">
                  {`{
  "object": {"title": "Hello"},
  "source": "en",
  "targets": ["es", "fr", "de"]
}`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
