import Link from 'next/link'
import { Code2, Server } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function Footer() {
  return (
      <footer className="py-6 md:px-8 md:py-0">
          <div className="container flex flex-col items-center mx-auto gap-4 md:h-16">
              {/* Combined Group */}
              <div className="flex flex-col md:flex-row items-center gap-4">
                  {/* Developer Credit */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Developed by</span>
                      <TooltipProvider>
                          <Tooltip>
                              <TooltipTrigger asChild>
                                  <Button variant="link" className="h-auto p-0" asChild>
                                      <Link
                                          href="https://github.com/themohitnair"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="font-medium"
                                      >
                                          Mohit Nair
                                      </Link>
                                  </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                  <p>Visit GitHub profile</p>
                              </TooltipContent>
                          </Tooltip>
                      </TooltipProvider>
                  </div>

                  {/* Responsive Separator */}
                  <Separator 
                      orientation="vertical" 
                      className="hidden md:block h-6 mx-4" 
                  />
                  <Separator 
                      orientation="horizontal" 
                      className="md:hidden w-[200px]" 
                  />

                  {/* Source Code + Hosting */}
                  <div className="flex items-center gap-4">
                      <TooltipProvider>
                          <Tooltip>
                              <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                      <Link
                                          href="https://github.com/themohitnair/rit-titlepage"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          aria-label="Source code"
                                      >
                                          <Code2 className="h-4 w-4" />
                                      </Link>
                                  </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                  <p>View source code</p>
                              </TooltipContent>
                          </Tooltip>
                      </TooltipProvider>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Server className="h-3 w-3" />
                          <span>Hosted on Google Cloud Run</span>
                      </div>
                  </div>
              </div>
          </div>
      </footer>
  )
}