"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
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
  const [targetLanguage, setTargetLanguage] = useState("es")
  const [textResult, setTextResult] = useState("")
  const [objectResult, setObjectResult] = useState("")
  const [isTranslatingText, setIsTranslatingText] = useState(false)
  const [isTranslatingObject, setIsTranslatingObject] = useState(false)

  const handleTextTranslation = async () => {
    if (!textInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to translate",
        variant: "destructive",
      })
      return
    }

    setIsTranslatingText(true)
    try {
      const response = await fetch("/api/translate/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: textInput,
          source: sourceLanguage,
          target: targetLanguage,
        }),
      })

      if (!response.ok) {
        throw new Error("Translation failed")
      }

      const data = await response.json()
      setTextResult(data.translatedText)
      toast({
        title: "Success",
        description: "Text translated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to translate text. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTranslatingText(false)
    }
  }

  const handleObjectTranslation = async () => {
    if (!objectInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a JSON object to translate",
        variant: "destructive",
      })
      return
    }

    let parsedObject
    try {
      parsedObject = JSON.parse(objectInput)
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid JSON format. Please check your input.",
        variant: "destructive",
      })
      return
    }

    setIsTranslatingObject(true)
    try {
      const response = await fetch("/api/translate/object", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          object: parsedObject,
          source: sourceLanguage,
          target: targetLanguage,
        }),
      })

      if (!response.ok) {
        throw new Error("Translation failed")
      }

      const data = await response.json()
      setObjectResult(JSON.stringify(data.translatedObject, null, 2))
      toast({
        title: "Success",
        description: "Object translated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to translate object. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTranslatingObject(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Languages className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">AI Translator</h1>
          </div>
          <p className="text-lg text-gray-600">Powered by Gemini AI - Translate text and JSON objects instantly</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Language Settings
            </CardTitle>
            <CardDescription>Select source and target languages for translation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source-language">Source Language</Label>
                <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                  <SelectTrigger id="source-language">
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
                <Label htmlFor="target-language">Target Language</Label>
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger id="target-language">
                    <SelectValue placeholder="Select target language" />
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
                <CardDescription>Enter any text to translate it to your target language</CardDescription>
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
                {textResult && (
                  <div className="space-y-2">
                    <Label>Translation Result</Label>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-green-800">{textResult}</p>
                    </div>
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
                  Enter a JSON object to translate all string values to your target language
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
                {objectResult && (
                  <div className="space-y-2">
                    <Label>Translation Result</Label>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                      <pre className="text-green-800 text-sm overflow-x-auto">{objectResult}</pre>
                    </div>
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
                <h3 className="font-semibold mb-2">Object Translation</h3>
                <code className="text-sm text-gray-600">POST /api/translate/object</code>
                <pre className="text-xs mt-2 text-gray-500">
                  {`{
  "object": {"title": "Hello"},
  "source": "en",
  "target": "es"
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
