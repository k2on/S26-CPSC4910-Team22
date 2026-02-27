import { PaletteIcon, SunIcon, MoonIcon, MonitorIcon } from "lucide-react";
import { DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "../ui/dropdown-menu";
import { useTheme } from "next-themes";

export function ThemeSelector() {
        const { theme, setTheme } = useTheme()

        return (

                <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                                <PaletteIcon />
                                Theme
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                        <DropdownMenuGroup>
                                                <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                                                <DropdownMenuRadioGroup
                                                        value={theme}
                                                        onValueChange={setTheme}
                                                >
                                                        <DropdownMenuRadioItem value="light">
                                                                <SunIcon />
                                                                Light
                                                        </DropdownMenuRadioItem>
                                                        <DropdownMenuRadioItem value="dark">
                                                                <MoonIcon />
                                                                Dark
                                                        </DropdownMenuRadioItem>
                                                        <DropdownMenuRadioItem value="system">
                                                                <MonitorIcon />
                                                                System
                                                        </DropdownMenuRadioItem>
                                                </DropdownMenuRadioGroup>
                                        </DropdownMenuGroup>
                                </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                </DropdownMenuSub>
        )
}
