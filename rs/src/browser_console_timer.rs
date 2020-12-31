extern crate web_sys;
use web_sys::console;

#[derive(Debug)]
pub struct Timer<'a> {
    ended: bool,
    name: &'a str,
}

impl<'a> Timer<'a> {
    pub fn new(name: &'a str) -> Timer<'a> {
        console::time_with_label(name);
        Timer { name, ended: false }
    }

    pub fn end_now(&mut self) {
        console::time_end_with_label(self.name);
        self.ended = true;
    }
 }

impl<'a> Drop for Timer<'a> {
    fn drop(&mut self) {
        if !self.ended {
            console::time_end_with_label(self.name);
        }
    }
}
