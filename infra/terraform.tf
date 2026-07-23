terraform {
  required_version = "1.15.8"

  cloud {
    organization = "hatohui"

    workspaces {
      name = "hatohui"
    }
  }
}